import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { TransactionType } from '../transaction/transaction.enum';
import { Budget } from './budget.entity';
import { BudgetPeriod } from './budget.enum';
import { CreateBudgetDto } from './dtos/create-budget.dto';
import { ListBudgetDto } from './dtos/list-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';

export interface BudgetSummaryItem {
	budget: Budget;
	spent: number;
	remaining: number;
	percentage: number;
}

@Injectable()
export class BudgetService {
	constructor(
		@InjectRepository(Budget)
		private readonly budgetRepo: Repository<Budget>,
		@InjectRepository(Transaction)
		private readonly transactionRepo: Repository<Transaction>,
	) {}

	async create(dto: CreateBudgetDto, creatorId: string): Promise<Budget> {
		const where: FindOptionsWhere<Budget> = {
			creatorId,
			period: dto.period,
			category: dto.categoryId ? { id: dto.categoryId } : IsNull(),
		};

		const existing = await this.budgetRepo.findOne({ where });

		if (existing) {
			throw new ConflictException(
				'A budget with the same period and category already exists',
			);
		}

		const budget = this.budgetRepo.create({
			name: dto.name,
			period: dto.period,
			amount: dto.amount,
			category: dto.categoryId ? { id: dto.categoryId } : null,
			description: dto.description ?? null,
			creatorId,
		});

		return this.budgetRepo.save(budget);
	}

	async update(
		id: string,
		dto: UpdateBudgetDto,
		creatorId: string,
	): Promise<Budget> {
		const budget = await this.budgetRepo.findOne({
			where: { id, creatorId },
		});
		if (!budget) throw new NotFoundException('Budget not found');

		if (dto.name !== undefined) budget.name = dto.name;
		if (dto.period !== undefined) budget.period = dto.period;
		if (dto.amount !== undefined) budget.amount = dto.amount;
		if (dto.description !== undefined)
			budget.description = dto.description ?? null;
		if (dto.categoryId !== undefined) {
			budget.category = dto.categoryId
				? ({ id: dto.categoryId } as any)
				: null;
		}

		return this.budgetRepo.save(budget);
	}

	async remove(id: string, creatorId: string): Promise<void> {
		const budget = await this.budgetRepo.findOne({
			where: { id, creatorId },
		});
		if (!budget) throw new NotFoundException('Budget not found');
		await this.budgetRepo.remove(budget);
	}

	async findAll(
		query: ListBudgetDto,
		creatorId: string,
	): Promise<PaginatedResponseDto<Budget>> {
		const { period, categoryId, skip, limit, page, pageSize } = query;

		const where: FindOptionsWhere<Budget> = { creatorId };
		if (period) where.period = period;
		if (categoryId) where.category = { id: categoryId };

		const [items, total] = await this.budgetRepo.findAndCount({
			where,
			relations: ['category', 'category.icon'],
			skip,
			take: limit,
			order: { createdAt: 'DESC' },
		});

		const meta = new PaginationMeta({ total, page, pageSize });
		return new PaginatedResponseDto(items, meta);
	}

	/**
	 * Get budget summary for the current period.
	 * Monthly budgets → calculates spent for current month.
	 * Yearly budgets → calculates spent for current year.
	 */
	async getSummary(creatorId: string): Promise<BudgetSummaryItem[]> {
		const budgets = await this.budgetRepo.find({
			where: { creatorId },
			relations: ['category', 'category.icon'],
			order: { amount: 'DESC' },
		});

		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1;

		const summaries: BudgetSummaryItem[] = [];

		for (const budget of budgets) {
			const spent = await this.getSpentAmount(
				budget,
				currentYear,
				currentMonth,
			);
			const remaining = Number(budget.amount) - spent;
			const percentage =
				Number(budget.amount) > 0
					? Math.round((spent / Number(budget.amount)) * 100)
					: 0;

			summaries.push({ budget, spent, remaining, percentage });
		}

		return summaries;
	}

	private async getSpentAmount(
		budget: Budget,
		year: number,
		month: number,
	): Promise<number> {
		const qb = this.transactionRepo
			.createQueryBuilder('t')
			.select('COALESCE(SUM(t.amount), 0)', 'total')
			.where('t.creator_id = :creatorId', { creatorId: budget.creatorId })
			.andWhere('t.type = :type', { type: TransactionType.EXPENSE });

		if (budget.period === BudgetPeriod.MONTH) {
			qb.andWhere(
				"EXTRACT(YEAR FROM t.transaction_date) = :year AND EXTRACT(MONTH FROM t.transaction_date) = :month",
				{ year, month },
			);
		} else {
			qb.andWhere("EXTRACT(YEAR FROM t.transaction_date) = :year", {
				year,
			});
		}

		if (budget.category) {
			qb.andWhere('t.category_id = :categoryId', {
				categoryId: budget.category.id,
			});
		}

		const result = await qb.getRawOne();
		return parseFloat(result?.total ?? '0');
	}
}

import {
	HttpException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { OrderDirection } from 'src/common/enums/common';
import { DataSource, EntityManager } from 'typeorm';
import { Account } from '../account/account.entity';
import { AccountBalanceService } from '../account/services/account-balance.service';
import { Category } from '../category/category.entity';
import { ActionType } from '../category/enums/action-type.enum';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { FindTransactionDto } from './dtos/find-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { Transaction } from './transaction.entity';
import { TransactionOrderBy } from './transaction.enum';

@Injectable()
export class TransactionService {
	private readonly logger = new Logger(TransactionService.name);

	constructor(
		private readonly ds: DataSource,
		private readonly accountBalanceService: AccountBalanceService,
	) {}

	async findAll(
		findTransactionDto: FindTransactionDto,
	): Promise<PaginatedResponseDto<Transaction>> {
		const {
			page,
			pageSize,
			skip,
			keyword,
			categoryIds,
			accountIds,
			transactionDate,
			amount,
			orderBy = TransactionOrderBy.TRANSACTION_DATE,
			orderDirection = OrderDirection.DESC,
		} = findTransactionDto;

		const repo = this.ds.getRepository(Transaction);
		const qb = repo
			.createQueryBuilder('transaction')
			.select([
				'transaction.id',
				'transaction.amount',
				'transaction.description',
				'transaction.transactionDate',
				'transaction.createdAt',
				'transaction.updatedAt',
			])
			// join account and only pull id + name
			.leftJoin('transaction.account', 'account')
			.addSelect(['account.id', 'account.name'])
			// join category and only pull id, name, actionType
			.leftJoin('transaction.category', 'category')
			.addSelect(['category.id', 'category.name', 'category.actionType']);

		// dynamic filters
		if (keyword) {
			qb.andWhere('transaction.description ILIKE :kw', {
				kw: `%${keyword}%`,
			});
		}
		if (accountIds?.length) {
			qb.andWhere('account.id IN (:...aIds)', { aIds: accountIds });
		}
		if (categoryIds?.length) {
			qb.andWhere('category.id IN (:...cIds)', { cIds: categoryIds });
		}
		if (transactionDate) {
			qb.andWhere('transaction.transactionDate BETWEEN :from AND :to', {
				from: transactionDate[0],
				to: transactionDate[1],
			});
		}
		if (amount) {
			qb.andWhere('transaction.amount BETWEEN :min AND :max', {
				min: amount[0],
				max: amount[1],
			});
		}

		// ordering & pagination
		qb.orderBy(`transaction.${orderBy}`, orderDirection)
			.skip(skip)
			.take(pageSize);

		// execute
		const [items, total] = await qb.getManyAndCount();

		const meta = new PaginationMeta({
			total,
			page,
			pageSize,
		});

		return new PaginatedResponseDto(items, meta);
	}

	async findOne(id: string): Promise<Transaction> {
		return this.ds.getRepository(Transaction).findOneOrFail({
			where: { id },
			relations: ['account', 'category'],
		});
	}

	async create(dto: CreateTransactionDto): Promise<Transaction> {
		return this.ds
			.transaction(async (manager) => {
				// 1) load category inside TX
				const category = await manager.findOne(Category, {
					where: { id: dto.categoryId },
				});
				if (!category) {
					throw new NotFoundException(
						`Category with ID ${dto.categoryId} not found`,
					);
				}

				// 2) update balance via our new service, inside the same TX
				const account = await this.accountBalanceService.updateBalance(
					dto.accountId,
					dto.amount,
					category.actionType,
					manager,
				);

				// 3) create & save the transaction
				const tx = manager.create(Transaction, {
					account,
					category,
					amount: dto.amount,
					description: dto.description,
					transactionDate: dto.transactionDate,
				});
				return manager.save(tx);
			})
			.catch((error) => this.throwError(error, 'create transaction'));
	}

	async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
		return this.ds
			.transaction(async (manager) => {
				const repo = manager.getRepository(Transaction);

				// 1) Load existing transaction + relations
				const existing = await repo.findOne({
					where: { id },
					relations: ['account', 'category'],
					select: ['id', 'account', 'category', 'amount'],
				});
				if (!existing) {
					throw new NotFoundException(
						`Transaction with ID ${id} not found`,
					);
				}

				// 2) Extract “original” values
				const origAccountId = existing.account.id;
				const origCategoryId = existing.category.id;
				const origCategoryAction = existing.category.actionType;
				const origAmount = existing.amount;

				// 3) Compute “new” values (fall back to original)
				const newAccountId = dto.accountId ?? origAccountId;
				const newCategory = dto.categoryId
					? await manager.findOneOrFail(Category, {
							where: { id: dto.categoryId },
							select: ['id', 'actionType'],
						})
					: existing.category;
				const newAmount = dto.amount ?? origAmount;

				// 4) Only if account, category or amount changed → adjust balances
				const accountChanged = newAccountId !== origAccountId;
				const categoryChanged = newCategory.id !== origCategoryId;
				const amountChanged = Number(newAmount) !== Number(origAmount);

				if (accountChanged || categoryChanged || amountChanged) {
					// a) Reverse the original effect
					const reverseAction: ActionType =
						origCategoryAction === ActionType.INCOME
							? ActionType.EXPENSE
							: ActionType.INCOME;
					await this.accountBalanceService.updateBalance(
						origAccountId,
						origAmount,
						reverseAction,
						manager,
					);

					// b) Apply the new effect
					await this.accountBalanceService.updateBalance(
						newAccountId,
						newAmount,
						newCategory.actionType,
						manager,
					);
				}

				// 5) Patch and save the transaction entity
				existing.account = { id: newAccountId } as Account;
				existing.category = newCategory;
				existing.amount = newAmount;
				if (dto.description !== undefined)
					existing.description = dto.description;
				if (dto.transactionDate !== undefined)
					existing.transactionDate = dto.transactionDate;

				return repo.save(existing);
			})
			.catch((error) => this.throwError(error, 'update transaction'));
	}

	async remove(id: string): Promise<void> {
		return this.ds
			.transaction(async (manager) => {
				const repo = manager.getRepository(Transaction);
				await this.reverseBalanceEffect(id, manager);
				await repo.delete(id);
			})
			.catch((error) => this.throwError(error, 'remove transaction'));
	}

	private async reverseBalanceEffect(
		transactionId: string,
		manager: EntityManager,
	) {
		const repo = manager.getRepository(Transaction);

		// 1) load existing transaction with relations
		const existing = await repo.findOne({
			where: { id: transactionId },
			relations: ['account', 'category'],
		});
		if (!existing) {
			throw new NotFoundException(
				`Transaction with ID ${transactionId} not found`,
			);
		}

		// original values
		const origAccount = existing.account;
		const origCategory = existing.category;
		const origAmount = existing.amount;

		// 2) reverse original balance effect
		const reverseAction: ActionType =
			origCategory.actionType === ActionType.INCOME
				? ActionType.EXPENSE
				: ActionType.INCOME;
		await this.accountBalanceService.updateBalance(
			origAccount.id,
			origAmount,
			reverseAction,
			manager,
		);

		return {
			origAccount,
			origCategory,
			origAmount,
		};
	}

	private throwError<T>(error: unknown, action: string): T {
		// 1) If it’s already a Nest/HTTP exception, just re-throw it
		if (error instanceof HttpException) {
			throw error;
		}

		// 2) Otherwise log & wrap it
		this.logger.error(
			`Time: ${new Date().toISOString()}: Could not ${action}:`,
			error as any,
		);

		const msg = error instanceof Error ? error.message : 'Unexpected error';
		throw new InternalServerErrorException(`Could not ${action}: ${msg}`);
	}
}

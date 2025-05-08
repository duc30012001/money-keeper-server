import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticTransactionDto } from '../dtos/analytic-transaction.dto';
import {
	AnalyticResult,
	ChartResult,
	ExpenseByParentCategoryResult,
	IncomeByParentCategoryResult,
} from '../interfaces/transaction.interface';
import { Transaction } from '../transaction.entity';
import { TransactionType } from '../transaction.enum';

@Injectable()
export class TransactionAnalyticService {
	constructor(
		@InjectRepository(Transaction)
		private readonly transactionRepo: Repository<Transaction>,
	) {}

	async getAnalytics(dto: AnalyticTransactionDto): Promise<AnalyticResult> {
		// 1. Determine date range
		const now = new Date();
		const [start, end] =
			dto.transactionDate && dto.transactionDate.length === 2
				? dto.transactionDate
				: [
						new Date(now.getFullYear(), now.getMonth(), 1),
						new Date(
							now.getFullYear(),
							now.getMonth() + 1,
							0,
							23,
							59,
							59,
							999,
						),
					];

		// 2. Helper to sum by type
		const sumByType = async (
			type: TransactionType,
			from: Date,
			to: Date,
		): Promise<number> => {
			const data = await this.transactionRepo
				.createQueryBuilder('t')
				.select('SUM(t.amount)', 'sum')
				.where('t.type = :type', { type })
				.andWhere('t.transactionDate BETWEEN :from AND :to', {
					from,
					to,
				})
				.getRawOne<{ sum: string }>();
			return parseFloat(data?.sum || '0');
		};

		// 3. Current period sums
		const incomeCur = await sumByType(TransactionType.INCOME, start, end);
		const expenseCur = await sumByType(TransactionType.EXPENSE, start, end);
		const netCur = incomeCur - expenseCur;

		// 4. Previous period: same length immediately before [start…end]
		const durationMs = end.getTime() - start.getTime();
		const prevEnd = new Date(start.getTime() - 1);
		const prevStart = new Date(prevEnd.getTime() - durationMs);

		// 5. Previous period sums
		const incomePrev = await sumByType(
			TransactionType.INCOME,
			prevStart,
			prevEnd,
		);
		const expensePrev = await sumByType(
			TransactionType.EXPENSE,
			prevStart,
			prevEnd,
		);
		const netPrev = incomePrev - expensePrev;

		// 6. Percentage change helper
		const pctChange = (cur: number, prev: number): number | null => {
			const res = prev === 0 ? null : ((cur - prev) / prev) * 100;
			return Number(res?.toFixed(2));
		};

		// 7. Return combined analytics
		return {
			current: { income: incomeCur, expenses: expenseCur, net: netCur },
			previous: {
				income: incomePrev,
				expenses: expensePrev,
				net: netPrev,
			},
			change: {
				income: pctChange(incomeCur, incomePrev),
				expenses: pctChange(expenseCur, expensePrev),
				net: pctChange(netCur, netPrev),
			},
		};
	}

	async getMonthlyIncomeExpense(
		dto: AnalyticTransactionDto,
	): Promise<ChartResult[]> {
		// 1) date range
		const now = new Date();
		const [from, to] =
			dto.transactionDate && dto.transactionDate.length === 2
				? dto.transactionDate
				: [
						// default: start of current month
						new Date(now.getFullYear(), now.getMonth(), 1),
						// end of current month
						new Date(
							now.getFullYear(),
							now.getMonth() + 1,
							0,
							23,
							59,
							59,
							999,
						),
					];

		// 2) build query
		const qb = this.transactionRepo
			.createQueryBuilder('t')
			// format month label: e.g. "May 2025"
			.select(
				`to_char(date_trunc('month', t.transactionDate), 'Mon YYYY')`,
				'label',
			)
			// sum income only
			.addSelect(
				`SUM(CASE WHEN t.type = :inc THEN t.amount ELSE 0 END)`,
				'income',
			)
			// sum expense only
			.addSelect(
				`SUM(CASE WHEN t.type = :exp THEN t.amount ELSE 0 END)`,
				'expense',
			)
			.where('t.transactionDate BETWEEN :from AND :to', { from, to })
			// only standard income/expense
			.andWhere('t.type IN (:inc, :exp)', {
				inc: TransactionType.INCOME,
				exp: TransactionType.EXPENSE,
			});

		// 3) apply optional filters
		if (dto.accountIds?.length) {
			qb.andWhere('t.account_id IN (:...accountIds)', {
				accountIds: dto.accountIds,
			});
		}
		if (dto.categoryIds?.length) {
			qb.andWhere('t.category_id IN (:...categoryIds)', {
				categoryIds: dto.categoryIds,
			});
		}

		// 4) group & order by month
		const rows = await qb
			.groupBy(`date_trunc('month', t.transactionDate)`)
			.orderBy(`date_trunc('month', t.transactionDate)`, 'ASC')
			.setParameters({
				inc: TransactionType.INCOME,
				exp: TransactionType.EXPENSE,
			})
			.getRawMany<{
				label: string;
				income: string;
				expense: string;
			}>();

		// 5) map to numbers
		return rows.map((r) => ({
			label: r.label,
			income: parseFloat(r.income) || 0,
			expense: parseFloat(r.expense) || 0,
		}));
	}

	async getExpenseByParentCategories(
		dto: AnalyticTransactionDto,
	): Promise<ExpenseByParentCategoryResult[]> {
		// 1) Date range
		const now = new Date();
		const [from, to] =
			dto.transactionDate?.length === 2
				? dto.transactionDate
				: [
						new Date(now.getFullYear(), now.getMonth(), 1),
						new Date(
							now.getFullYear(),
							now.getMonth() + 1,
							0,
							23,
							59,
							59,
							999,
						),
					];

		// 2) Build the query
		const qb = this.transactionRepo
			.createQueryBuilder('t')
			.select(`COALESCE(parent.name, category.name)`, 'label')
			.addSelect(`SUM(t.amount)`, 'expense')
			.leftJoin('t.category', 'category')
			.leftJoin('category.parent', 'parent')
			.where('t.type = :exp', { exp: TransactionType.EXPENSE })
			.andWhere('t.transactionDate BETWEEN :from AND :to', { from, to });

		// 3) Optional DTO filters
		if (dto.accountIds?.length) {
			qb.andWhere('t.account_id IN (:...accountIds)', {
				accountIds: dto.accountIds,
			});
		}
		if (dto.categoryIds?.length) {
			qb.andWhere('category.id IN (:...categoryIds)', {
				categoryIds: dto.categoryIds,
			});
		}

		// 4) Group & order
		const raw = await qb
			.groupBy(`COALESCE(parent.name, category.name)`)
			.orderBy('expense', 'DESC')
			.getRawMany<{ label: string; expense: string }>();

		// 5) Map and roll-up “Other” if needed
		const data = raw.map((r) => ({
			label: r.label,
			value: parseFloat(r.expense) || 0,
		}));

		if (data.length > 6) {
			const top5 = data.slice(0, 5);
			const otherTotal = data
				.slice(5)
				.reduce((sum, c) => sum + c.value, 0);
			top5.push({ label: 'Other', value: otherTotal });
			return top5;
		}

		return data;
	}

	async getIncomeByParentCategories(
		dto: AnalyticTransactionDto,
	): Promise<IncomeByParentCategoryResult[]> {
		// 1) Date range
		const now = new Date();
		const [from, to] =
			dto.transactionDate?.length === 2
				? dto.transactionDate
				: [
						new Date(now.getFullYear(), now.getMonth(), 1),
						new Date(
							now.getFullYear(),
							now.getMonth() + 1,
							0,
							23,
							59,
							59,
							999,
						),
					];

		// 2) Build the query
		const qb = this.transactionRepo
			.createQueryBuilder('t')
			.select(`COALESCE(parent.name, category.name)`, 'label')
			.addSelect(`SUM(t.amount)`, 'income')
			.leftJoin('t.category', 'category')
			.leftJoin('category.parent', 'parent')
			.where('t.type = :inc', { inc: TransactionType.INCOME })
			.andWhere('t.transactionDate BETWEEN :from AND :to', { from, to });

		// 3) Optional DTO filters
		if (dto.accountIds?.length) {
			qb.andWhere('t.account_id IN (:...accountIds)', {
				accountIds: dto.accountIds,
			});
		}
		if (dto.categoryIds?.length) {
			qb.andWhere('category.id IN (:...categoryIds)', {
				categoryIds: dto.categoryIds,
			});
		}

		// 4) Group & order
		const raw = await qb
			.groupBy(`COALESCE(parent.name, category.name)`)
			.orderBy('income', 'DESC')
			.getRawMany<{ label: string; income: string }>();

		// 5) Map and roll-up “Other” if needed
		const data = raw.map((r) => ({
			label: r.label,
			value: parseFloat(r.income) || 0,
		}));

		if (data.length > 6) {
			const top5 = data.slice(0, 5);
			const otherTotal = data
				.slice(5)
				.reduce((sum, c) => sum + c.value, 0);
			top5.push({ label: 'Other', value: otherTotal });
			return top5;
		}

		return data;
	}
}

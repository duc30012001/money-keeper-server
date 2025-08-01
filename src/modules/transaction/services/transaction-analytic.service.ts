import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getDateRange } from 'src/utils/date';
import { Brackets, Repository } from 'typeorm';
import {
	AnalyticParentCategoryDto,
	AnalyticTransactionByDateDto,
	AnalyticTransactionDto,
} from '../dtos/analytic-transaction.dto';
import {
	AnalyticByParentCategoryResult,
	AnalyticResult,
	ChartResult,
} from '../interfaces/transaction.interface';
import { Transaction } from '../transaction.entity';
import { AnalyticChartGroupBy, TransactionType } from '../transaction.enum';

@Injectable()
export class TransactionAnalyticService {
	constructor(
		@InjectRepository(Transaction)
		private readonly transactionRepo: Repository<Transaction>,
	) {}

	async getAnalytics(
		analyticTransactionDto: AnalyticTransactionDto,
		creatorId: string,
	): Promise<AnalyticResult> {
		const { transactionDate, accountIds, categoryIds } =
			analyticTransactionDto;

		// 1. Determine date range
		const [start, end] = getDateRange(transactionDate);

		// 2. Helper to sum by type
		const sumByType = async (
			type: TransactionType,
			from: Date,
			to: Date,
		): Promise<number> => {
			const qb = this.transactionRepo
				.createQueryBuilder('t')
				.leftJoin('t.account', 'account')
				.leftJoin('t.category', 'category')
				.select('SUM(t.amount)', 'sum')
				.where('t.type = :type', { type })
				.andWhere('t.creatorId = :creatorId', { creatorId })
				.andWhere('t.transactionDate BETWEEN :from AND :to', {
					from,
					to,
				});

			if (accountIds?.length) {
				qb.andWhere('account.id IN(:...accountIds)', { accountIds });
			}
			if (categoryIds?.length) {
				qb.andWhere(
					new Brackets((subQb) => {
						subQb
							.andWhere('category.id IN(:...categoryIds)', {
								categoryIds,
							})
							.orWhere('category.parent_id IN(:...categoryIds)', {
								categoryIds,
							});
					}),
				);
			}

			const data = await qb.getRawOne<{ sum: string }>();
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

	async getChartIncomeExpense(
		queryParams: AnalyticTransactionByDateDto,
		creatorId: string,
	): Promise<ChartResult[]> {
		const {
			transactionDate,
			accountIds,
			categoryIds,
			chartGroupBy = AnalyticChartGroupBy.MONTH,
		} = queryParams;
		// 1) date range
		const [from, to] = getDateRange(transactionDate);

		// 2) build query
		const queryBuilder = this.transactionRepo
			.createQueryBuilder('t')
			.leftJoin('t.account', 'account')
			.leftJoin('t.category', 'category');

		// format date label based on chartGroupBy
		const dateFormats: Record<AnalyticChartGroupBy, string> = {
			[AnalyticChartGroupBy.DAY]: 'DD Mon YYYY',
			[AnalyticChartGroupBy.MONTH]: 'Mon YYYY',
			[AnalyticChartGroupBy.YEAR]: 'YYYY',
		};

		const format =
			dateFormats[chartGroupBy] ||
			dateFormats[AnalyticChartGroupBy.MONTH];
		queryBuilder.select(
			`to_char(date_trunc('${chartGroupBy}', t.transactionDate), '${format}')`,
			'label',
		);

		// sum income only
		queryBuilder
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
			.andWhere('t.creatorId = :creatorId', { creatorId })
			// only standard income/expense
			.andWhere('t.type IN (:inc, :exp)', {
				inc: TransactionType.INCOME,
				exp: TransactionType.EXPENSE,
			});

		// 3) apply optional filters
		if (accountIds?.length) {
			queryBuilder.andWhere('account.id IN(:...accountIds)', {
				accountIds,
			});
		}
		if (categoryIds?.length) {
			queryBuilder.andWhere(
				new Brackets((subQb) => {
					subQb
						.andWhere('category.id IN(:...categoryIds)', {
							categoryIds,
						})
						.orWhere('category.parent_id IN(:...categoryIds)', {
							categoryIds,
						});
				}),
			);
		}

		// 4) group & order by the same date truncation
		const rows = await queryBuilder
			.groupBy(`date_trunc('${chartGroupBy}', t.transactionDate)`)
			.orderBy(`date_trunc('${chartGroupBy}', t.transactionDate)`, 'ASC')
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

	async getAnalyticParentCategory(
		queryParams: AnalyticParentCategoryDto,
		creatorId: string,
	): Promise<AnalyticByParentCategoryResult[]> {
		const { transactionDate, accountIds, categoryIds, categoryType } =
			queryParams;
		// 1) Date range
		const [from, to] = getDateRange(transactionDate);

		// 2) Build the query
		const queryBuilder = this.transactionRepo
			.createQueryBuilder('t')
			.leftJoin('t.account', 'account')
			.select(`COALESCE(parent.name, category.name)`, 'label')
			.addSelect(`SUM(t.amount)`, 'value')
			.leftJoin('t.category', 'category')
			.leftJoin('category.parent', 'parent')
			.where('t.type = :type', { type: categoryType })
			.andWhere('t.creatorId = :creatorId', { creatorId })
			.andWhere('t.transactionDate BETWEEN :from AND :to', { from, to });

		// 3) Optional DTO filters
		if (accountIds?.length) {
			queryBuilder.andWhere('account.id IN(:...accountIds)', {
				accountIds,
			});
		}
		if (categoryIds?.length) {
			queryBuilder.andWhere(
				new Brackets((subQb) => {
					subQb
						.andWhere('category.id IN(:...categoryIds)', {
							categoryIds,
						})
						.orWhere('category.parent_id IN(:...categoryIds)', {
							categoryIds,
						});
				}),
			);
		}

		// 4) Group & order
		const raw = await queryBuilder
			.groupBy(`COALESCE(parent.name, category.name)`)
			.orderBy('value', 'DESC')
			.getRawMany<{ label: string; value: string }>();

		// 5) Map and roll-up “Other” if needed
		const data = raw.map((r) => ({
			label: r.label,
			value: parseFloat(r.value) || 0,
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

// import {
// 	HttpException,
// 	Injectable,
// 	InternalServerErrorException,
// 	Logger,
// 	NotFoundException,
// } from '@nestjs/common';
// import {
// 	PaginatedResponseDto,
// 	PaginationMeta,
// } from 'src/common/dtos/response.dto';
// import { OrderDirection } from 'src/common/enums/common';
// import { DataSource, EntityManager } from 'typeorm';
// import { Account } from '../account/account.entity';
// import { AccountBalanceService } from '../account/services/account-balance.service';
// import { Category } from '../category/category.entity';
// import { CategoryType } from '../category/enums/action-type.enum';
// import { CreateTransactionDto } from './dtos/create-transaction.dto';
// import { FindTransactionDto } from './dtos/find-transaction.dto';
// import { UpdateTransactionDto } from './dtos/update-transaction.dto';
// import { Transaction } from './transaction.entity';
// import { TransactionOrderBy, TransactionType } from './transaction.enum';

// @Injectable()
// export class TransactionService {
// 	private readonly logger = new Logger(TransactionService.name);

// 	constructor(
// 		private readonly ds: DataSource,
// 		private readonly accountBalanceService: AccountBalanceService,
// 	) {}

// 	async findAll(
// 		findTransactionDto: FindTransactionDto,
// 	): Promise<PaginatedResponseDto<Transaction>> {
// 		const {
// 			page,
// 			pageSize,
// 			skip,
// 			keyword,
// 			categoryIds,
// 			accountIds,
// 			transactionDate,
// 			amount,
// 			orderBy = TransactionOrderBy.TRANSACTION_DATE,
// 			orderDirection = OrderDirection.DESC,
// 		} = findTransactionDto;

// 		const repo = this.ds.getRepository(Transaction);
// 		const qb = repo
// 			.createQueryBuilder('transaction')
// 			.select([
// 				'transaction.id',
// 				'transaction.amount',
// 				'transaction.description',
// 				'transaction.transactionDate',
// 				'transaction.createdAt',
// 				'transaction.updatedAt',
// 			])
// 			// join account and only pull id + name
// 			.leftJoin('transaction.account', 'account')
// 			.addSelect(['account.id', 'account.name'])
// 			// join category and only pull id, name, type
// 			.leftJoin('transaction.category', 'category')
// 			.addSelect(['category.id', 'category.name', 'category.type']);

// 		// dynamic filters
// 		if (keyword) {
// 			qb.andWhere('transaction.description ILIKE :kw', {
// 				kw: `%${keyword}%`,
// 			});
// 		}
// 		if (accountIds?.length) {
// 			qb.andWhere('account.id IN (:...aIds)', { aIds: accountIds });
// 		}
// 		if (categoryIds?.length) {
// 			qb.andWhere('category.id IN (:...cIds)', { cIds: categoryIds });
// 		}
// 		if (transactionDate) {
// 			qb.andWhere('transaction.transactionDate BETWEEN :from AND :to', {
// 				from: transactionDate[0],
// 				to: transactionDate[1],
// 			});
// 		}
// 		if (amount) {
// 			qb.andWhere('transaction.amount BETWEEN :min AND :max', {
// 				min: amount[0],
// 				max: amount[1],
// 			});
// 		}

// 		// ordering & pagination
// 		qb.orderBy(`transaction.${orderBy}`, orderDirection)
// 			.skip(skip)
// 			.take(pageSize);

// 		// execute
// 		const [items, total] = await qb.getManyAndCount();

// 		const meta = new PaginationMeta({
// 			total,
// 			page,
// 			pageSize,
// 		});

// 		return new PaginatedResponseDto(items, meta);
// 	}

// 	async findOne(id: string): Promise<Transaction> {
// 		return this.ds.getRepository(Transaction).findOneOrFail({
// 			where: { id },
// 			relations: ['account', 'category'],
// 		});
// 	}

// 	/**
// 	 * Creates a transaction.
// 	 * - For TRANSFER: adjust both balances, then create one record containing sender & receiver.
// 	 * - For INCOME/EXPENSE: load category, adjust balance, then create one record.
// 	 */
// 	async create(dto: CreateTransactionDto): Promise<Transaction> {
// 		return this.ds
// 			.transaction(async (manager: EntityManager) => {
// 				// --- TRANSFER ---
// 				if (dto.type === TransactionType.TRANSFER) {
// 					// 1) Reverse and apply balances
// 					await this.accountBalanceService.updateBalance(
// 						dto.senderAccountId!,
// 						dto.amount,
// 						CategoryType.EXPENSE,
// 						manager,
// 					);
// 					await this.accountBalanceService.updateBalance(
// 						dto.receiverAccountId!,
// 						dto.amount,
// 						CategoryType.INCOME,
// 						manager,
// 					);

// 					// 2) Create single transfer record
// 					const tx = manager.create(Transaction, {
// 						type: TransactionType.TRANSFER,
// 						senderAccount: { id: dto.senderAccountId },
// 						receiverAccount: { id: dto.receiverAccountId },
// 						amount: dto.amount,
// 						description: dto.description,
// 						transactionDate: dto.transactionDate,
// 					});

// 					return manager.save(tx);
// 				}

// 				// --- INCOME or EXPENSE ---
// 				// 1) Load category (typed!)
// 				const category = await manager.findOneOrFail<Category>(
// 					Category,
// 					{
// 						where: { id: dto.categoryId },
// 						select: ['id', 'type'],
// 					},
// 				);

// 				// 2) Adjust balance
// 				const account = await this.accountBalanceService.updateBalance(
// 					dto.accountId!,
// 					dto.amount,
// 					category.type,
// 					manager,
// 				);

// 				// 3) Create & save the single transaction
// 				const tx = manager.create(Transaction, {
// 					type: dto.type,
// 					account,
// 					category,
// 					amount:
// 						dto.type === TransactionType.EXPENSE
// 							? -dto.amount
// 							: dto.amount,
// 					description: dto.description,
// 					transactionDate: dto.transactionDate,
// 				});

// 				return manager.save(tx);
// 			})
// 			.catch((error: unknown) =>
// 				this.throwError(error, 'create transaction'),
// 			);
// 	}

// 	/**
// 	 * Update a transaction (single record for all types).
// 	 * - TRANSFER: reverse old sender/receiver effects, apply new ones, patch record.
// 	 * - INCOME/EXPENSE: reverse old, apply new, patch record.
// 	 */
// 	async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
// 		return this.ds
// 			.transaction(async (manager: EntityManager) => {
// 				const repo = manager.getRepository<Transaction>(Transaction);

// 				// 1) Load the existing transaction
// 				const tx = await repo.findOne({
// 					where: { id },
// 					relations: [
// 						'account',
// 						'category',
// 						'senderAccount',
// 						'receiverAccount',
// 					],
// 				});
// 				if (!tx) {
// 					throw new NotFoundException(`Transaction ${id} not found`);
// 				}

// 				// 2) Reverse old balance effects
// 				if (tx.type === TransactionType.TRANSFER) {
// 					// undo old transfer
// 					await this.accountBalanceService.updateBalance(
// 						tx.senderAccount!.id,
// 						Math.abs(tx.amount),
// 						CategoryType.INCOME,
// 						manager,
// 					);
// 					await this.accountBalanceService.updateBalance(
// 						tx.receiverAccount!.id,
// 						Math.abs(tx.amount),
// 						CategoryType.EXPENSE,
// 						manager,
// 					);
// 				} else {
// 					// undo old income/expense
// 					const origAmount = Number(tx.amount);
// 					const reverseType =
// 						tx.category!.type === CategoryType.INCOME
// 							? CategoryType.EXPENSE
// 							: CategoryType.INCOME;
// 					await this.accountBalanceService.updateBalance(
// 						tx.account!.id,
// 						Math.abs(origAmount),
// 						reverseType,
// 						manager,
// 					);
// 				}

// 				// 3) Figure out “new” values (fallback to old)
// 				const newType = dto.type ?? tx.type;
// 				const newAmt = dto.amount ?? Math.abs(Number(tx.amount));
// 				const newDate = dto.transactionDate ?? tx.transactionDate;
// 				const newDesc = dto.description ?? tx.description;

// 				if (newType === TransactionType.TRANSFER) {
// 					// update sender/receiver IDs
// 					const newSenderId =
// 						dto.senderAccountId ?? tx.senderAccount!.id;
// 					const newReceiverId =
// 						dto.receiverAccountId ?? tx.receiverAccount!.id;

// 					// apply new transfer
// 					await this.accountBalanceService.updateBalance(
// 						newSenderId,
// 						newAmt,
// 						CategoryType.EXPENSE,
// 						manager,
// 					);
// 					await this.accountBalanceService.updateBalance(
// 						newReceiverId,
// 						newAmt,
// 						CategoryType.INCOME,
// 						manager,
// 					);

// 					// patch the record
// 					tx.type = TransactionType.TRANSFER;
// 					tx.senderAccount = { id: newSenderId } as Account;
// 					tx.receiverAccount = { id: newReceiverId } as Account;
// 					tx.account = undefined;
// 					tx.category = undefined;
// 					tx.amount = newAmt; // positive sign represents transfer amount
// 				} else {
// 					// INCOME or EXPENSE
// 					// load new category if provided
// 					const newCategory: Category = dto.categoryId
// 						? await manager.findOneOrFail<Category>(Category, {
// 								where: { id: dto.categoryId },
// 								select: ['id', 'type'],
// 							})
// 						: tx.category!;

// 					// apply new balance
// 					await this.accountBalanceService.updateBalance(
// 						dto.accountId ?? tx.account!.id,
// 						newAmt,
// 						newCategory.type,
// 						manager,
// 					);

// 					// patch the record
// 					tx.type = newType;
// 					tx.account = {
// 						id: dto.accountId ?? tx.account!.id,
// 					} as Account;
// 					tx.category = newCategory;
// 					tx.senderAccount = undefined;
// 					tx.receiverAccount = undefined;
// 					tx.amount =
// 						newCategory.type === CategoryType.EXPENSE
// 							? -newAmt
// 							: newAmt;
// 				}

// 				// common patches
// 				tx.transactionDate = newDate;
// 				tx.description = newDesc;

// 				// 4) Persist & return
// 				return repo.save(tx);
// 			})
// 			.catch((error: unknown) =>
// 				this.throwError(error, 'update transaction'),
// 			);
// 	}

// 	/**
// 	 * Remove a transaction.
// 	 * - For TRANSFER: reverse both sides and delete the single record.
// 	 * - For INCOME/EXPENSE: reverse its effect and delete.
// 	 */
// 	async remove(id: string): Promise<void> {
// 		await this.ds
// 			.transaction(async (manager: EntityManager) => {
// 				const repo = manager.getRepository<Transaction>(Transaction);

// 				// 1) load the record + relations
// 				const tx = await repo.findOne({
// 					where: { id },
// 					relations: [
// 						'account',
// 						'category',
// 						'senderAccount',
// 						'receiverAccount',
// 					],
// 				});
// 				if (!tx) {
// 					throw new NotFoundException(`Transaction ${id} not found`);
// 				}

// 				// 2) reverse balances
// 				if (tx.type === TransactionType.TRANSFER) {
// 					// undo the transfer: credit sender, debit receiver
// 					await this.accountBalanceService.updateBalance(
// 						tx.senderAccount!.id,
// 						tx.amount,
// 						CategoryType.INCOME,
// 						manager,
// 					);
// 					await this.accountBalanceService.updateBalance(
// 						tx.receiverAccount!.id,
// 						tx.amount,
// 						CategoryType.EXPENSE,
// 						manager,
// 					);
// 				} else {
// 					// undo income/expense
// 					const origAmount = Math.abs(Number(tx.amount));
// 					const reverseType =
// 						tx.category!.type === CategoryType.INCOME
// 							? CategoryType.EXPENSE
// 							: CategoryType.INCOME;

// 					await this.accountBalanceService.updateBalance(
// 						tx.account!.id,
// 						origAmount,
// 						reverseType,
// 						manager,
// 					);
// 				}

// 				// 3) delete the transaction
// 				await manager.remove(tx);
// 			})
// 			.catch((error: unknown) =>
// 				this.throwError(error, 'remove transaction'),
// 			);
// 	}

// 	private throwError<T>(error: unknown, action: string): T {
// 		// 1) If it’s already a Nest/HTTP exception, just re-throw it
// 		if (error instanceof HttpException) {
// 			throw error;
// 		}

// 		// 2) Otherwise log & wrap it
// 		this.logger.error(
// 			`Time: ${new Date().toISOString()}: Could not ${action}:`,
// 			error as any,
// 		);

// 		const msg = error instanceof Error ? error.message : 'Unexpected error';
// 		throw new InternalServerErrorException(`Could not ${action}: ${msg}`);
// 	}
// }

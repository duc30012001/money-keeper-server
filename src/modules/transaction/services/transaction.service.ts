import {
	BadRequestException,
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
import { Account } from 'src/modules/account/account.entity';
import { AccountBalanceService } from 'src/modules/account/services/account-balance.service';
import { Category } from 'src/modules/category/category.entity';
import { CategoryType } from 'src/modules/category/category.enum';
import { CreateTransactionDto } from 'src/modules/transaction/dtos/create-transaction.dto';
import { FindTransactionDto } from 'src/modules/transaction/dtos/find-transaction.dto';
import { UpdateTransactionDto } from 'src/modules/transaction/dtos/update-transaction.dto';
import { Transaction } from 'src/modules/transaction/transaction.entity';
import { TransactionType } from 'src/modules/transaction/transaction.enum';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionService {
	private readonly logger = new Logger(TransactionService.name);

	constructor(
		private readonly ds: DataSource,
		private readonly accountBalanceService: AccountBalanceService,
	) {}

	// ------------------------------------------------------------
	// PUBLIC — QUERYING
	// ------------------------------------------------------------
	async findAll(
		dto: FindTransactionDto,
	): Promise<PaginatedResponseDto<Transaction>> {
		const {
			page,
			pageSize,
			skip,
			keyword,
			categoryIds,
			accountIds,
			senderAccountIds,
			receiverAccountIds,
			transactionDate,
			amount,
			type,
			sort,
		} = dto;

		const repo = this.ds.getRepository(Transaction);
		const qb = repo
			.createQueryBuilder('tx')
			.select([
				'tx.id',
				'tx.amount',
				'tx.type',
				'tx.description',
				'tx.transactionDate',
				'tx.createdAt',
				'tx.updatedAt',
			])
			.leftJoin('tx.account', 'account')
			.addSelect(['account.id', 'account.name'])
			.leftJoin('tx.category', 'category')
			.addSelect(['category.id', 'category.name'])
			.leftJoin('tx.senderAccount', 'senderAccount')
			.addSelect(['senderAccount.id', 'senderAccount.name'])
			.leftJoin('tx.receiverAccount', 'receiverAccount')
			.addSelect(['receiverAccount.id', 'receiverAccount.name']);

		if (keyword) {
			qb.andWhere('tx.description ILIKE :kw', { kw: `%${keyword}%` });
		}
		if (accountIds?.length) {
			qb.andWhere('account.id IN(:...accountIds)', { accountIds });
		}
		if (categoryIds?.length) {
			qb.andWhere('category.id IN(:...categoryIds)', { categoryIds });
		}
		if (senderAccountIds?.length) {
			qb.andWhere('senderAccount.id IN(:...senderAccountIds)', {
				senderAccountIds,
			});
		}
		if (receiverAccountIds?.length) {
			qb.andWhere('receiverAccount.id IN(:...receiverAccountIds)', {
				receiverAccountIds,
			});
		}
		if (type?.length) {
			qb.andWhere('tx.type IN(:...types)', { types: type });
		}
		if (transactionDate) {
			qb.andWhere('tx.transactionDate BETWEEN :from AND :to', {
				from: transactionDate[0],
				to: transactionDate[1],
			});
		}
		if (amount) {
			qb.andWhere('tx.amount BETWEEN :min AND :max', {
				min: amount[0],
				max: amount[1],
			});
		}

		if (sort?.length) {
			for (const s of sort) {
				qb.orderBy(`tx.${s.id}`, s.desc ? 'DESC' : 'ASC');
			}
		} else {
			qb.orderBy(`tx.transactionDate`, 'DESC');
		}
		qb.skip(skip).take(pageSize);

		const [items, total] = await qb.getManyAndCount();
		const meta = new PaginationMeta({ total, page, pageSize });
		return new PaginatedResponseDto(items, meta);
	}

	async findOne(id: string): Promise<Transaction> {
		const tx = await this.ds.getRepository(Transaction).findOne({
			where: { id },
			relations: [
				'account',
				'category',
				'senderAccount',
				'receiverAccount',
			],
		});
		if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
		return tx;
	}

	// ------------------------------------------------------------
	// PUBLIC — MUTATIONS
	// ------------------------------------------------------------
	async create(dto: CreateTransactionDto): Promise<Transaction> {
		return this.ds
			.transaction((manager) => this._create(manager, dto))
			.catch((err) => this._wrapError(err, 'create transaction'));
	}

	async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
		return this.ds
			.transaction((manager) => this._update(manager, id, dto))
			.catch((err) => this._wrapError(err, 'update transaction'));
	}

	async remove(id: string): Promise<void> {
		await this.ds
			.transaction((manager) => this._remove(manager, id))
			.catch((err) => this._wrapError(err, 'remove transaction'));
	}

	// ------------------------------------------------------------
	// PRIVATE — CREATE
	// ------------------------------------------------------------
	private async _create(
		manager: EntityManager,
		dto: CreateTransactionDto,
	): Promise<Transaction> {
		return dto.type === TransactionType.TRANSFER
			? this._createTransfer(manager, dto)
			: this._createStandard(manager, dto);
	}

	private async _createTransfer(
		manager: EntityManager,
		dto: CreateTransactionDto,
	): Promise<Transaction> {
		// adjust both balances
		await this.accountBalanceService.updateBalance(
			dto.senderAccountId!,
			dto.amount,
			CategoryType.EXPENSE,
			manager,
		);
		await this.accountBalanceService.updateBalance(
			dto.receiverAccountId!,
			dto.amount,
			CategoryType.INCOME,
			manager,
		);

		// create single record
		const tx = manager.create(Transaction, {
			type: TransactionType.TRANSFER,
			senderAccount: { id: dto.senderAccountId } as Account,
			receiverAccount: { id: dto.receiverAccountId } as Account,
			amount: dto.amount,
			description: dto.description,
			transactionDate: dto.transactionDate,
		});
		return manager.save(tx);
	}

	private async _createStandard(
		manager: EntityManager,
		dto: CreateTransactionDto,
	): Promise<Transaction> {
		// load category
		const category = await manager.findOneOrFail<Category>(Category, {
			where: { id: dto.categoryId! },
			select: ['id', 'type'],
		});

		// ✋ validate match
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (dto.type !== category.type) {
			throw new BadRequestException(
				`Transaction type "${dto.type}" does not match category type "${category.type}".`,
			);
		}

		// adjust balance
		const account = await this.accountBalanceService.updateBalance(
			dto.accountId!,
			dto.amount,
			category.type,
			manager,
		);

		// create and return
		const tx = manager.create(Transaction, {
			type: dto.type,
			account,
			category,
			amount: dto.amount,
			description: dto.description,
			transactionDate: dto.transactionDate,
		});
		return manager.save(tx);
	}

	// ------------------------------------------------------------
	// PRIVATE — UPDATE
	// ------------------------------------------------------------
	private async _update(
		manager: EntityManager,
		id: string,
		dto: UpdateTransactionDto,
	): Promise<Transaction> {
		const repo = manager.getRepository<Transaction>(Transaction);
		const tx = await repo.findOne({
			where: { id },
			relations: [
				'account',
				'category',
				'senderAccount',
				'receiverAccount',
			],
		});
		if (!tx) throw new NotFoundException(`Transaction ${id} not found`);

		// 1) undo old effects
		await this._reverseEffects(tx, manager);

		// 2) apply new
		const patched = await this._applyNewValues(tx, dto, manager);

		// 3) persist
		return repo.save(patched);
	}

	private async _applyNewValues(
		tx: Transaction,
		dto: UpdateTransactionDto,
		manager: EntityManager,
	): Promise<Transaction> {
		// base fallbacks
		const newType = dto.type ?? tx.type;
		const newAmt = dto.amount ?? Math.abs(Number(tx.amount));
		const newDate = dto.transactionDate ?? tx.transactionDate;
		const newDesc = dto.description ?? tx.description;

		if (newType === TransactionType.TRANSFER) {
			// ➡️ converting TO transfer: clear standard fields
			const senderId = dto.senderAccountId ?? tx.senderAccount!.id;
			const receiverId = dto.receiverAccountId ?? tx.receiverAccount!.id;

			// apply balances
			await this.accountBalanceService.updateBalance(
				senderId,
				newAmt,
				CategoryType.EXPENSE,
				manager,
			);
			await this.accountBalanceService.updateBalance(
				receiverId,
				newAmt,
				CategoryType.INCOME,
				manager,
			);

			// patch transfer fields
			tx.type = TransactionType.TRANSFER;
			tx.senderAccount = { id: senderId } as Account;
			tx.receiverAccount = { id: receiverId } as Account;
			tx.account = null;
			tx.category = null;
			tx.amount = newAmt;
		} else {
			// ➡️ converting TO standard: clear transfer fields
			const newCategory: Category = dto.categoryId
				? await manager.findOneOrFail<Category>(Category, {
						where: { id: dto.categoryId },
						select: ['id', 'type'],
					})
				: tx.category!;

			// ✋ validate match
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (newType !== newCategory.type) {
				throw new BadRequestException(
					`Transaction type "${newType}" does not match category type "${newCategory.type}".`,
				);
			}

			// apply balance
			const accId = dto.accountId ?? tx.account!.id;
			await this.accountBalanceService.updateBalance(
				accId,
				newAmt,
				newCategory.type,
				manager,
			);

			// patch standard fields
			tx.type = newType;
			tx.account = { id: accId } as Account;
			tx.category = newCategory;
			tx.senderAccount = null;
			tx.receiverAccount = null;
			tx.amount =
				newCategory.type === CategoryType.EXPENSE ? -newAmt : newAmt;
		}

		// common patches
		tx.transactionDate = newDate;
		tx.description = newDesc;
		return tx;
	}

	private async _reverseEffects(tx: Transaction, manager: EntityManager) {
		if (tx.type === TransactionType.TRANSFER) {
			// undo transfer
			await this.accountBalanceService.updateBalance(
				tx.senderAccount!.id,
				Math.abs(tx.amount),
				CategoryType.INCOME,
				manager,
			);
			await this.accountBalanceService.updateBalance(
				tx.receiverAccount!.id,
				Math.abs(tx.amount),
				CategoryType.EXPENSE,
				manager,
			);
		} else {
			// undo standard
			const origAmt = Math.abs(Number(tx.amount));
			const reverseType =
				tx.category!.type === CategoryType.INCOME
					? CategoryType.EXPENSE
					: CategoryType.INCOME;
			await this.accountBalanceService.updateBalance(
				tx.account!.id,
				origAmt,
				reverseType,
				manager,
			);
		}
	}

	// ------------------------------------------------------------
	// PRIVATE — REMOVE
	// ------------------------------------------------------------
	private async _remove(manager: EntityManager, id: string): Promise<void> {
		const repo = manager.getRepository<Transaction>(Transaction);
		const tx = await repo.findOne({
			where: { id },
			relations: [
				'account',
				'category',
				'senderAccount',
				'receiverAccount',
			],
		});
		if (!tx) throw new NotFoundException(`Transaction ${id} not found`);

		// undo
		await this._reverseEffects(tx, manager);

		// delete
		await manager.remove(tx);
	}

	// ------------------------------------------------------------
	// PRIVATE — ERROR HANDLING
	// ------------------------------------------------------------
	private _wrapError(error: unknown, action: string): never {
		if (error instanceof HttpException) throw error;
		this.logger.error(`Failed to ${action}`, error as any);
		const msg = error instanceof Error ? error.message : 'Unknown error';
		throw new InternalServerErrorException(`Could not ${action}: ${msg}`);
	}
}

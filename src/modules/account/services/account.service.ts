import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { IconService } from 'src/modules/icon/icon.service';
import { TransactionService } from 'src/modules/transaction/services/transaction.service';
import { AccountTypeService } from '../../account-type/account-type.service';
import { Account } from '../account.entity';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { FindAccountDto } from '../dtos/find-account.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { UpdateSortOrderDto } from '../dtos/update-sort-order.dto';

@Injectable()
export class AccountService {
	constructor(
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>,
		private readonly accountTypeService: AccountTypeService,
		private readonly iconService: IconService,
		private readonly transactionService: TransactionService,
	) {}

	async findAll(
		findAccountDto: FindAccountDto,
		creatorId: string,
	): Promise<PaginatedResponseDto<Account>> {
		const { skip, pageSize, page, keyword, accountTypeIds, sort } =
			findAccountDto;

		const qb = this.accountRepository
			.createQueryBuilder('account')
			.leftJoin('account.accountType', 'accountType')
			.leftJoin('account.icon', 'icon')
			.addSelect([
				'accountType.id',
				'accountType.name',
				'accountType.sortOrder',
				'icon.id',
				'icon.name',
				'icon.url',
			])
			.where('account.creatorId = :creatorId', { creatorId });

		// apply your filters
		if (keyword) {
			qb.andWhere('account.name ILIKE :kw', { kw: `%${keyword}%` });
		}
		if (accountTypeIds?.length) {
			qb.andWhere('accountType.id IN (:...ids)', { ids: accountTypeIds });
		}

		if (sort?.length) {
			sort.forEach(({ id, desc }) => {
				qb.addOrderBy(`account.${id}`, desc ? 'DESC' : 'ASC');
			});
		}
		// ordering: first by accountType.sortOrder, then by account.sortOrder
		qb.addOrderBy('accountType.sortOrder', 'ASC')
			.addOrderBy('accountType.name', 'ASC')
			// .addOrderBy('account.sortOrder', 'ASC')
			.addOrderBy('account.name', 'ASC')
			.skip(skip)
			.take(pageSize);

		// run & paginate
		const [items, total] = await qb.getManyAndCount();
		const meta = new PaginationMeta({ total, page, pageSize });
		return new PaginatedResponseDto(items, meta);
	}

	async findOne(id: string, creatorId: string): Promise<Account> {
		const account = await this.accountRepository.findOne({
			where: { id, creatorId },
			relations: ['accountType', 'icon'],
		});
		if (!account) {
			throw new NotFoundException(`Account with ID ${id} not found`);
		}
		return account;
	}

	private async findByName(name: string): Promise<Account | null> {
		return this.accountRepository.findOne({
			where: { name },
			relations: ['accountType'],
		});
	}

	async create(
		createAccountDto: CreateAccountDto,
		creatorId: string,
	): Promise<Account> {
		const existingAccount = await this.findByName(createAccountDto.name);
		if (existingAccount) {
			throw new ConflictException(
				`Account with name '${createAccountDto.name}' already exists`,
			);
		}

		const accountType = await this.accountTypeService.findOne(
			createAccountDto.accountTypeId,
			creatorId,
		);

		const icon = await this.iconService.findOne(createAccountDto.iconId);

		const account = this.accountRepository.create({
			...createAccountDto,
			initialBalance: createAccountDto.initialBalance?.toString() ?? '0',
			balance: createAccountDto.initialBalance?.toString() ?? '0',
			accountType,
			icon,
			creatorId,
		});

		return this.accountRepository.save(account);
	}

	async update(
		id: string,
		updateAccountDto: UpdateAccountDto,
		creatorId: string,
	): Promise<Account> {
		// load existing account (including its accountType relation)
		const account = await this.accountRepository.findOne({
			where: { id, creatorId },
			relations: ['accountType'],
		});
		if (!account) throw new NotFoundException(`Account ${id} not found`);

		// 1) name-uniqueness check
		if (updateAccountDto.name && updateAccountDto.name !== account.name) {
			const existing = await this.findByName(updateAccountDto.name);
			if (existing) {
				throw new ConflictException(
					`Account with name '${updateAccountDto.name}' already exists`,
				);
			}
		}

		// 2) accountType change
		if (
			updateAccountDto.accountTypeId &&
			updateAccountDto.accountTypeId !== account.accountType.id
		) {
			const acctType = await this.accountTypeService.findOne(
				updateAccountDto.accountTypeId,
				creatorId,
			);
			account.accountType = acctType;
		}

		// 3) icon change
		if (
			updateAccountDto.iconId &&
			updateAccountDto.iconId !== account.icon?.id
		) {
			const icon = await this.iconService.findOne(
				updateAccountDto.iconId,
			);
			account.icon = icon;
		}

		// 4) initialBalance change → adjust balance by the delta
		if (
			updateAccountDto.initialBalance !== undefined &&
			parseFloat(updateAccountDto.initialBalance.toString()) !==
				parseFloat(account.initialBalance)
		) {
			const delta =
				parseFloat(updateAccountDto.initialBalance.toString()) -
				parseFloat(account.initialBalance);
			const newBalance = Number(account.balance) + delta;
			account.balance = newBalance.toString();
		}

		// 5) copy over any other fields (including initialBalance)
		Object.assign(account, updateAccountDto);

		await this.accountRepository.save(account);

		// return fresh entity
		return this.findOne(id, creatorId);
	}

	async remove(id: string, creatorId: string): Promise<void> {
		await this.transactionService.removeByAccountId(id, creatorId);
		await this.findOne(id, creatorId);
		await this.accountRepository.delete(id);
	}

	async updateSortOrder(
		updateSortOrderDto: UpdateSortOrderDto,
		creatorId: string,
	): Promise<Account[]> {
		// Verify all IDs exist in a single query
		const existingAccounts = await this.accountRepository.find({
			where: { id: In(updateSortOrderDto.ids), creatorId },
		});

		if (existingAccounts.length !== updateSortOrderDto.ids.length) {
			const existingIds = new Set(existingAccounts.map((at) => at.id));
			const missingIds = updateSortOrderDto.ids.filter(
				(id) => !existingIds.has(id),
			);
			throw new NotFoundException(
				`Accounts with IDs ${missingIds.join(', ')} not found`,
			);
		}

		// Update all account types in a single query using CASE
		await this.accountRepository
			.createQueryBuilder()
			.update(Account)
			.set({
				sortOrder: () =>
					`CASE id ${updateSortOrderDto.ids
						.map((id, index) => `WHEN '${id}' THEN ${index + 1}`)
						.join(' ')} END`,
			})
			.where('id IN (:...ids)', { ids: updateSortOrderDto.ids })
			.execute();

		// Return updated list
		return this.accountRepository.find({
			where: { id: In(updateSortOrderDto.ids) },
			order: {
				sortOrder: 'ASC',
				name: 'ASC',
			},
		});
	}
}

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
import { Locale } from 'src/common/enums/common';
import { accountInitial } from 'src/initial-data/initial-data';
import { AccountType } from 'src/modules/account-type/account-type.entity';
import { IconService } from 'src/modules/icon/icon.service';
import { TransactionService } from 'src/modules/transaction/services/transaction.service';
import { getName } from 'src/utils/common';
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
		payload: CreateAccountDto,
		creatorId: string,
	): Promise<Account> {
		const existingAccount = await this.findByName(payload.name);
		if (existingAccount) {
			throw new ConflictException(
				`Account with name '${payload.name}' already exists`,
			);
		}

		const accountType = await this.accountTypeService.findOne(
			payload.accountTypeId,
			creatorId,
		);

		const icon = await this.iconService.findOne(payload.iconId);

		const account = this.accountRepository.create({
			...payload,
			initialBalance: payload.initialBalance?.toString() ?? '0',
			balance: payload.initialBalance?.toString() ?? '0',
			accountType,
			icon,
			creatorId,
		});

		return this.accountRepository.save(account);
	}

	async update(
		id: string,
		payload: UpdateAccountDto,
		creatorId: string,
	): Promise<Account> {
		// load existing account (including its accountType relation)
		const account = await this.accountRepository.findOne({
			where: { id, creatorId },
			relations: ['accountType'],
		});
		if (!account) throw new NotFoundException(`Account ${id} not found`);

		// 1) name-uniqueness check
		if (payload.name && payload.name !== account.name) {
			const existing = await this.findByName(payload.name);
			if (existing) {
				throw new ConflictException(
					`Account with name '${payload.name}' already exists`,
				);
			}
		}

		// 2) accountType change
		if (
			payload.accountTypeId &&
			payload.accountTypeId !== account.accountType.id
		) {
			const acctType = await this.accountTypeService.findOne(
				payload.accountTypeId,
				creatorId,
			);
			account.accountType = acctType;
		}

		// 3) icon change
		if (payload.iconId && payload.iconId !== account.icon?.id) {
			const icon = await this.iconService.findOne(payload.iconId);
			account.icon = icon;
		}

		// 4) initialBalance change → adjust balance by the delta
		if (
			payload.initialBalance !== undefined &&
			parseFloat(payload.initialBalance.toString()) !==
				parseFloat(account.initialBalance)
		) {
			const delta =
				parseFloat(payload.initialBalance.toString()) -
				parseFloat(account.initialBalance);
			const newBalance = Number(account.balance) + delta;
			account.balance = newBalance.toString();
		}

		// 5) copy over any other fields (including initialBalance)
		Object.assign(account, payload);

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

	async init(creatorId: string, locale: Locale) {
		const data = accountInitial.map(async (item, index) => {
			const { nameVi, nameEn, accountType } = item;
			const accountTypeName = getName({
				nameEn: accountType.nameEn,
				nameVi: accountType.nameVi,
				locale,
			});
			const accountTypeData = await this.accountTypeService.findByName(
				accountTypeName,
				creatorId,
				{ icon: true },
			);
			return this.accountRepository.create({
				name: getName({ nameEn, nameVi, locale }),
				creatorId,
				icon: accountTypeData?.icon,
				sortOrder: index + 1,
				initialBalance: '0',
				balance: '0',
				accountType: accountTypeData as AccountType,
			});
		});
		return this.accountRepository.save(await Promise.all(data));
	}
}

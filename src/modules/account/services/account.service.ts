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
import { AccountTypeService } from '../../account-type/account-type.service';
import { CategoryType } from '../../category/category.enum';
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
	) {}

	async findAll(
		findAccountDto: FindAccountDto,
	): Promise<PaginatedResponseDto<Account>> {
		const { skip, pageSize, page, keyword, accountTypeIds } =
			findAccountDto;

		const qb = this.accountRepository
			.createQueryBuilder('account')
			// join the AccountType relation...
			.leftJoin('account.accountType', 'accountType')
			// ...but only select the three columns you care about
			.addSelect([
				'accountType.id',
				'accountType.name',
				'accountType.sortOrder',
			]);

		// apply your filters
		if (keyword) {
			qb.andWhere('account.name ILIKE :kw', { kw: `%${keyword}%` });
		}
		if (accountTypeIds?.length) {
			qb.andWhere('accountType.id IN (:...ids)', { ids: accountTypeIds });
		}

		// ordering: first by accountType.sortOrder, then by account.sortOrder
		qb.orderBy('accountType.sortOrder', 'ASC')
			.addOrderBy('accountType.name', 'ASC')
			.addOrderBy('account.sortOrder', 'ASC')
			.addOrderBy('account.name', 'ASC')
			.skip(skip)
			.take(pageSize);

		// run & paginate
		const [items, total] = await qb.getManyAndCount();
		const meta = new PaginationMeta({ total, page, pageSize });
		return new PaginatedResponseDto(items, meta);
	}

	async findOne(id: string): Promise<Account> {
		const account = await this.accountRepository.findOne({
			where: { id },
			relations: ['accountType'],
		});
		if (!account) {
			throw new NotFoundException(`Account with ID ${id} not found`);
		}
		return account;
	}

	async findByName(name: string): Promise<Account | null> {
		return this.accountRepository.findOne({
			where: { name },
			relations: ['accountType'],
		});
	}

	async create(createAccountDto: CreateAccountDto): Promise<Account> {
		const existingAccount = await this.findByName(createAccountDto.name);
		if (existingAccount) {
			throw new ConflictException(
				`Account with name '${createAccountDto.name}' already exists`,
			);
		}

		const accountType = await this.accountTypeService.findOne(
			createAccountDto.accountTypeId,
		);

		const account = this.accountRepository.create({
			...createAccountDto,
			balance: createAccountDto.initialBalance,
		});
		account.accountType = accountType;

		return this.accountRepository.save(account);
	}

	async update(
		id: string,
		updateAccountDto: UpdateAccountDto,
	): Promise<Account> {
		// load existing account (including its accountType relation)
		const account = await this.accountRepository.findOne({
			where: { id },
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
			);
			account.accountType = acctType;
		}

		// 3) initialBalance change → adjust balance by the delta
		if (
			updateAccountDto.initialBalance !== undefined &&
			updateAccountDto.initialBalance !== account.initialBalance
		) {
			const delta =
				updateAccountDto.initialBalance - account.initialBalance;
			account.balance += delta;
		}

		// 4) copy over any other fields (including initialBalance)
		Object.assign(account, updateAccountDto);

		await this.accountRepository.save(account);

		// return fresh entity
		return this.findOne(id);
	}

	async remove(id: string): Promise<void> {
		await this.findOne(id);
		await this.accountRepository.delete(id);
	}

	async updateSortOrder(
		updateSortOrderDto: UpdateSortOrderDto,
	): Promise<Account[]> {
		// Verify all IDs exist in a single query
		const existingAccounts = await this.accountRepository.find({
			where: { id: In(updateSortOrderDto.ids) },
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

	async updateBalance(
		id: string,
		amount: number,
		type: CategoryType,
	): Promise<Account> {
		const account = await this.findOne(id);
		switch (type) {
			case CategoryType.INCOME:
				account.balance += amount;
				break;
			case CategoryType.EXPENSE:
				account.balance -= amount;
				break;
			default:
				// throw new BadRequestException('Invalid action type');
				break;
		}
		await this.accountRepository.save(account);
		return this.findOne(id);
	}
}

import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, In, Like, Repository } from 'typeorm';

import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { AccountTypeService } from '../account-type/account-type.service';
import { Account } from './account.entity';
import { CreateAccountDto } from './dtos/create-account.dto';
import { FindAccountDto } from './dtos/find-account.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

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
		const where: FindOneOptions<Account>['where'] = {};

		if (keyword) {
			where.name = Like(`%${keyword}%`);
		}

		if (accountTypeIds) {
			where.accountType = { id: In(accountTypeIds) };
		}

		const [items, total] = await this.accountRepository.findAndCount({
			order: {
				accountType: {
					sortOrder: 'ASC',
				},
				sortOrder: 'ASC',
			},
			relations: ['accountType'],
			where,
			take: pageSize,
			skip,
		});

		const meta: PaginationMeta = {
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};

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

		const account = this.accountRepository.create(createAccountDto);
		account.accountType = accountType;

		return this.accountRepository.save(account);
	}

	async update(
		id: string,
		updateAccountDto: UpdateAccountDto,
	): Promise<Account> {
		const account = await this.findOne(id);

		if (updateAccountDto.name && updateAccountDto.name !== account.name) {
			const existingAccount = await this.findByName(
				updateAccountDto.name,
			);
			if (existingAccount) {
				throw new ConflictException(
					`Account with name '${updateAccountDto.name}' already exists`,
				);
			}
		}

		if (
			updateAccountDto.accountTypeId &&
			updateAccountDto.accountTypeId !== account.accountType.id
		) {
			const accountType = await this.accountTypeService.findOne(
				updateAccountDto.accountTypeId,
			);
			account.accountType = accountType;
		}
		Object.assign(account, updateAccountDto);
		await this.accountRepository.save(account);
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
			},
		});
	}
}

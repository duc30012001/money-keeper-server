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
import { AccountType } from './account-type.entity';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { UpdateSortOrderDto } from './dto/update-sort-order.dto';

@Injectable()
export class AccountTypeService {
	constructor(
		@InjectRepository(AccountType)
		private readonly accountTypeRepository: Repository<AccountType>,
	) {}

	async findAll(): Promise<PaginatedResponseDto<AccountType>> {
		const [items, total] = await this.accountTypeRepository.findAndCount({
			order: {
				sortOrder: 'ASC',
			},
		});

		const pageSize = total;
		const page = 1;

		const meta: PaginationMeta = {
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};

		return new PaginatedResponseDto(items, meta);
	}

	async findOne(id: string): Promise<AccountType> {
		const accountType = await this.accountTypeRepository.findOne({
			where: { id },
		});
		if (!accountType) {
			throw new NotFoundException(`AccountType with ID ${id} not found`);
		}
		return accountType;
	}

	async findByName(name: string): Promise<AccountType | null> {
		return this.accountTypeRepository.findOne({
			where: { name },
		});
	}

	async create(
		createAccountTypeDto: CreateAccountTypeDto,
	): Promise<AccountType> {
		const existingAccountType = await this.findByName(
			createAccountTypeDto.name,
		);
		if (existingAccountType) {
			throw new ConflictException(
				`AccountType with name '${createAccountTypeDto.name}' already exists`,
			);
		}

		const accountType =
			this.accountTypeRepository.create(createAccountTypeDto);
		return this.accountTypeRepository.save(accountType);
	}

	async update(
		id: string,
		updateAccountTypeDto: UpdateAccountTypeDto,
	): Promise<AccountType> {
		const accountType = await this.findOne(id);

		if (
			updateAccountTypeDto.name &&
			updateAccountTypeDto.name !== accountType.name
		) {
			const existingAccountType = await this.findByName(
				updateAccountTypeDto.name,
			);
			if (existingAccountType) {
				throw new ConflictException(
					`AccountType with name '${updateAccountTypeDto.name}' already exists`,
				);
			}
		}

		await this.accountTypeRepository.update(id, updateAccountTypeDto);
		return this.findOne(id);
	}

	async remove(id: string): Promise<void> {
		await this.findOne(id);
		await this.accountTypeRepository.delete(id);
	}

	async updateSortOrder(
		updateSortOrderDto: UpdateSortOrderDto,
	): Promise<AccountType[]> {
		// Verify all IDs exist in a single query
		const existingAccountTypes = await this.accountTypeRepository.find({
			where: { id: In(updateSortOrderDto.ids) },
		});

		if (existingAccountTypes.length !== updateSortOrderDto.ids.length) {
			const existingIds = new Set(
				existingAccountTypes.map((at) => at.id),
			);
			const missingIds = updateSortOrderDto.ids.filter(
				(id) => !existingIds.has(id),
			);
			throw new NotFoundException(
				`AccountTypes with IDs ${missingIds.join(', ')} not found`,
			);
		}

		// Update all account types in a single query using CASE
		await this.accountTypeRepository
			.createQueryBuilder()
			.update(AccountType)
			.set({
				sortOrder: () =>
					`CASE id ${updateSortOrderDto.ids
						.map((id, index) => `WHEN '${id}' THEN ${index + 1}`)
						.join(' ')} END`,
			})
			.where('id IN (:...ids)', { ids: updateSortOrderDto.ids })
			.execute();

		// Return updated list
		return this.accountTypeRepository.find({
			where: { id: In(updateSortOrderDto.ids) },
			order: {
				sortOrder: 'ASC',
			},
		});
	}
}

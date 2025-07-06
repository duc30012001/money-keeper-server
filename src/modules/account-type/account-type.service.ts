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
import { CreateAccountTypeDto } from './dtos/create-account-type.dto';
import { UpdateAccountTypeDto } from './dtos/update-account-type.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

@Injectable()
export class AccountTypeService {
	constructor(
		@InjectRepository(AccountType)
		private readonly accountTypeRepository: Repository<AccountType>,
	) {}

	async findAll(
		creatorId: string,
	): Promise<PaginatedResponseDto<AccountType>> {
		const [items, total] = await this.accountTypeRepository.findAndCount({
			order: {
				sortOrder: 'ASC',
				name: 'ASC',
			},
			where: { creatorId },
		});

		const pageSize = total;
		const page = 1;

		const meta = new PaginationMeta({
			total,
			page,
			pageSize,
		});

		return new PaginatedResponseDto(items, meta);
	}

	async findOne(id: string, creatorId: string): Promise<AccountType> {
		const accountType = await this.accountTypeRepository.findOne({
			where: { id, creatorId },
		});
		if (!accountType) {
			throw new NotFoundException(`Account Type with ID ${id} not found`);
		}
		return accountType;
	}

	private async findByName(
		name: string,
		creatorId: string,
	): Promise<AccountType | null> {
		return this.accountTypeRepository.findOne({
			where: { name, creatorId },
		});
	}

	async create(
		createAccountTypeDto: CreateAccountTypeDto,
		creatorId: string,
	): Promise<AccountType> {
		const existingAccountType = await this.findByName(
			createAccountTypeDto.name,
			creatorId,
		);
		if (existingAccountType) {
			throw new ConflictException(
				`Account Type with name '${createAccountTypeDto.name}' already exists`,
			);
		}

		const accountType = this.accountTypeRepository.create({
			...createAccountTypeDto,
			creatorId,
		});
		return this.accountTypeRepository.save(accountType);
	}

	async update(
		id: string,
		updateAccountTypeDto: UpdateAccountTypeDto,
		creatorId: string,
	): Promise<AccountType> {
		const accountType = await this.findOne(id, creatorId);

		if (
			updateAccountTypeDto.name &&
			updateAccountTypeDto.name !== accountType.name
		) {
			const existingAccountType = await this.findByName(
				updateAccountTypeDto.name,
				creatorId,
			);
			if (existingAccountType) {
				throw new ConflictException(
					`Account Type with name '${updateAccountTypeDto.name}' already exists`,
				);
			}
		}

		await this.accountTypeRepository.update(id, updateAccountTypeDto);
		return this.findOne(id, creatorId);
	}

	async remove(id: string, creatorId: string): Promise<void> {
		await this.findOne(id, creatorId);
		await this.accountTypeRepository.delete(id);
	}

	async updateSortOrder(
		updateSortOrderDto: UpdateSortOrderDto,
		creatorId: string,
	): Promise<AccountType[]> {
		// Verify all IDs exist in a single query
		const existingAccountTypes = await this.accountTypeRepository.find({
			where: { id: In(updateSortOrderDto.ids), creatorId },
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
			where: { id: In(updateSortOrderDto.ids), creatorId },
			order: {
				sortOrder: 'ASC',
				name: 'ASC',
			},
		});
	}
}

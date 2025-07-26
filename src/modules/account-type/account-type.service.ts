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
import { accountTypeInitial } from 'src/initial-data';
import { getName } from 'src/utils/common';
import { IconService } from '../icon/icon.service';
import { AccountType } from './account-type.entity';
import { CreateAccountTypeDto } from './dtos/create-account-type.dto';
import { UpdateAccountTypeDto } from './dtos/update-account-type.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

@Injectable()
export class AccountTypeService {
	constructor(
		@InjectRepository(AccountType)
		private readonly accountTypeRepository: Repository<AccountType>,
		private readonly iconService: IconService,
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
			relations: ['icon'],
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
			relations: ['icon'],
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
		payload: CreateAccountTypeDto,
		creatorId: string,
	): Promise<AccountType> {
		const existingAccountType = await this.findByName(
			payload.name,
			creatorId,
		);
		if (existingAccountType) {
			throw new ConflictException(
				`Account Type with name '${payload.name}' already exists`,
			);
		}

		const icon = await this.iconService.findOne(payload.iconId);

		const accountType = this.accountTypeRepository.create({
			...payload,
			icon,
			creatorId,
		});
		return this.accountTypeRepository.save(accountType);
	}

	async update(
		id: string,
		payload: UpdateAccountTypeDto,
		creatorId: string,
	): Promise<AccountType> {
		const accountType = await this.findOne(id, creatorId);

		if (payload.name && payload.name !== accountType.name) {
			const existingAccountType = await this.findByName(
				payload.name,
				creatorId,
			);
			if (existingAccountType) {
				throw new ConflictException(
					`Account Type with name '${payload.name}' already exists`,
				);
			}
		}

		if (payload.iconId && payload.iconId !== accountType.icon?.id) {
			const icon = await this.iconService.findOne(payload.iconId);
			accountType.icon = icon;
		}
		Object.assign(accountType, payload);

		await this.accountTypeRepository.save(accountType);
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

	async init(creatorId: string, locale: Locale) {
		const data = accountTypeInitial.map((item, index) => {
			const { nameVi, nameEn, iconId } = item;
			return this.accountTypeRepository.create({
				name: getName({ nameEn, nameVi, locale }),
				creatorId,
				icon: {
					id: iconId,
				},
				sortOrder: index + 1,
			});
		});
		return this.accountTypeRepository.save(data);
	}
}

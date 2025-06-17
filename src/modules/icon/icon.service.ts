import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { CreateIconDto } from './dtos/create-icon.dto';
import { UpdateIconDto } from './dtos/update-icon.dto';
import { Icon } from './icon.entity';

@Injectable()
export class IconService {
	constructor(
		@InjectRepository(Icon)
		private readonly iconRepository: Repository<Icon>,
	) {}

	async findAll(): Promise<PaginatedResponseDto<Icon>> {
		const [items, total] = await this.iconRepository.findAndCount({
			order: {
				type: 'ASC',
				name: 'ASC',
			},
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

	async findOne(id: string): Promise<Icon> {
		const icon = await this.iconRepository.findOne({
			where: { id },
		});
		if (!icon) {
			throw new NotFoundException(`Icon with ID ${id} not found`);
		}
		return icon;
	}

	async create(createIconDto: CreateIconDto): Promise<Icon> {
		const icon = this.iconRepository.create(createIconDto);
		return this.iconRepository.save(icon);
	}

	async update(id: string, updateIconDto: UpdateIconDto): Promise<Icon> {
		await this.findOne(id);
		await this.iconRepository.update(id, updateIconDto);
		return this.findOne(id);
	}

	async remove(id: string): Promise<void> {
		await this.findOne(id);
		await this.iconRepository.delete(id);
	}
}

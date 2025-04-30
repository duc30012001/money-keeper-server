import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';

import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(Category)
		private readonly treeRepo: TreeRepository<Category>,
	) {}

	/** Lấy cả cây đầy đủ */
	async findAll(): Promise<PaginatedResponseDto<Category>> {
		const trees = await this.treeRepo.findTrees({
			relations: ['parent'],
		});
		const total = trees.length;
		const meta: PaginationMeta = {
			total,
			page: 1,
			pageSize: total,
			totalPages: 1,
		};
		return new PaginatedResponseDto(trees, meta);
	}

	/** Lấy một node cùng toàn bộ descendants */
	async findOne(id: string): Promise<Category> {
		const node = await this.treeRepo.findOne({
			where: { id },
			relations: ['parent'],
		});
		if (!node) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}
		const tree = await this.treeRepo.findDescendantsTree(node, {
			relations: ['parent'],
		});
		return tree;
	}

	/** Tạo mới, gán parent nếu có và tự động lưu closure-table */
	async create(dto: CreateCategoryDto): Promise<Category> {
		// Check duplicate name
		const dup = await this.treeRepo.findOne({ where: { name: dto.name } });
		if (dup) {
			throw new ConflictException(
				`Category '${dto.name}' already exists`,
			);
		}

		const category = this.treeRepo.create({
			name: dto.name,
			icon: dto.icon,
			actionType: dto.actionType,
			description: dto.description,
			sortOrder: dto.sortOrder,
		});

		if (dto.parentId) {
			const parent = await this.treeRepo.findOne({
				where: { id: dto.parentId },
			});
			if (!parent) {
				throw new NotFoundException(
					`Parent category ${dto.parentId} not found`,
				);
			}
			category.parent = parent;
		}

		const saved = await this.treeRepo.save(category);
		return this.findOne(saved.id);
	}

	/** Cập nhật thông tin và parent */
	async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
		const category = await this.treeRepo.findOne({ where: { id } });
		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}

		// Đổi tên nếu cần và check duplicate
		if (dto.name && dto.name !== category.name) {
			const dup = await this.treeRepo.findOne({
				where: { name: dto.name },
			});
			if (dup) {
				throw new ConflictException(
					`Category '${dto.name}' already exists`,
				);
			}
			category.name = dto.name;
		}

		// Parent: null → gỡ, id → set, undefined → giữ nguyên
		if (dto.parentId !== undefined) {
			if (dto.parentId === null) {
				category.parent = undefined;
			} else {
				const parent = await this.treeRepo.findOne({
					where: { id: dto.parentId },
				});
				if (!parent) {
					throw new NotFoundException(
						`Parent category ${dto.parentId} not found`,
					);
				}
				category.parent = parent;
			}
		}

		// Cập nhật các thuộc tính khác
		if (dto.icon !== undefined) category.icon = dto.icon;
		if (dto.description !== undefined)
			category.description = dto.description;
		if (dto.actionType !== undefined) category.actionType = dto.actionType;
		if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;

		await this.treeRepo.save(category);
		return this.findOne(id);
	}

	/** Xóa node (cascade với cây) */
	async remove(id: string): Promise<void> {
		const category = await this.treeRepo.findOne({ where: { id } });
		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}
		await this.treeRepo.remove(category);
	}

	/** Cập nhật sortOrder dùng QueryBuilder hoặc map rồi save lại */
	async updateSortOrder(dto: UpdateSortOrderDto): Promise<Category[]> {
		// Tương tự như trước, hoặc bạn có thể
		// load toàn bộ tree rồi set .sortOrder rồi save từng phần
		await this.treeRepo
			.createQueryBuilder()
			.update(Category)
			.set({
				sortOrder: () =>
					`CASE id ${dto.ids
						.map((id, i) => `WHEN '${id}' THEN ${i + 1}`)
						.join(' ')} END`,
			})
			.where('id IN (:...ids)', { ids: dto.ids })
			.execute();

		// Trả về cây đã sắp xếp lại
		return this.treeRepo.findTrees();
	}
}

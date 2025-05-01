import {
	BadRequestException,
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
import { buildTree, TreeNode } from 'src/utils/build-tree';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { FindCategoriesDto } from './dtos/find-categories.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(Category)
		private readonly treeRepo: TreeRepository<Category>,
	) {}

	async findAll(
		query?: FindCategoriesDto,
	): Promise<PaginatedResponseDto<TreeNode<Category, 'children'>>> {
		// 1. Xây điều kiện filter từ DTO
		const { keyword, actionType } = query ?? {};

		// 2. Lấy toàn bộ categories flat kèm relation parent
		const allCats = await this.treeRepo.find({
			relations: ['parent'],
			order: {
				actionType: 'ASC',
				sortOrder: 'ASC',
			},
		});

		// 3. Tách ra những node THOẢ điều kiện filter
		const matched = allCats.filter((cat) => {
			if (
				keyword &&
				!cat.name.toLowerCase().includes(keyword.toLowerCase())
			) {
				return false;
			}
			if (actionType?.length && !actionType.includes(cat.actionType)) {
				return false;
			}
			return true;
		});

		// 4. Thu thập tất cả ancestor của mỗi matched node
		const idToCat = new Map<string, Category>(
			allCats.map((c) => [c.id, c]),
		);
		const ancestorIds = new Set<string>();
		for (const node of matched) {
			let p = node.parent;
			while (p) {
				if (ancestorIds.has(p.id)) break;
				ancestorIds.add(p.id);
				p = idToCat.get(p.id)?.parent ?? undefined;
			}
		}

		// 5. Xác định tập các node được giữ lại (matched + ancestors)
		const allowedIds = new Set<string>([
			...matched.map((c) => c.id),
			...ancestorIds,
		]);
		const allowedNodes = allCats.filter((c) => allowedIds.has(c.id));

		// 6. Build tree
		const trees = buildTree(allowedNodes, {
			idKey: 'id',
			parentKey: 'parent',
			childrenKey: 'children',
		});

		// 7. Trả về kèm metadata
		const total = allowedNodes.length;
		const meta = new PaginationMeta({
			total,
			page: 1,
			pageSize: total,
		});
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
		const dup = await this.treeRepo.findOne({
			where: { name: dto.name },
		});
		if (dup) {
			throw new ConflictException(
				`Category '${dto.name}' already exists`,
			);
		}

		// Check parent's actionType if parent exists
		let parent: Category | undefined;
		if (dto.parentId) {
			const foundParent = await this.treeRepo.findOne({
				where: { id: dto.parentId },
			});
			if (!foundParent) {
				throw new NotFoundException(
					`Parent category ${dto.parentId} not found`,
				);
			}
			if (foundParent.actionType !== dto.actionType) {
				throw new BadRequestException(
					`Category's actionType must match parent's actionType. Parent has ${foundParent.actionType} but trying to set ${dto.actionType}`,
				);
			}
			parent = foundParent;
		}

		const category = this.treeRepo.create({
			name: dto.name,
			icon: dto.icon,
			actionType: dto.actionType,
			description: dto.description,
			sortOrder: dto.sortOrder,
		});

		if (parent) {
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

		// Check actionType change
		if (
			dto.actionType !== undefined &&
			dto.actionType !== category.actionType
		) {
			// Check if has children
			const children = await this.treeRepo.findDescendants(category);
			if (children.length > 1) {
				// includes itself
				throw new BadRequestException(
					'Cannot change actionType of a category that has children',
				);
			}

			// Check parent's actionType if parent exists
			if (category.parent) {
				if (category.parent.actionType !== dto.actionType) {
					throw new BadRequestException(
						`Category's actionType must match parent's actionType. Parent has ${category.parent.actionType} but trying to set ${dto.actionType}`,
					);
				}
			}
			category.actionType = dto.actionType;
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
				// Check if new parent's actionType matches
				if (parent.actionType !== category.actionType) {
					throw new BadRequestException(
						`Category's actionType must match parent's actionType. Parent has ${parent.actionType} but category has ${category.actionType}`,
					);
				}
				category.parent = parent;
			}
		}

		// Cập nhật các thuộc tính khác
		if (dto.icon !== undefined) category.icon = dto.icon;
		if (dto.description !== undefined)
			category.description = dto.description;
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

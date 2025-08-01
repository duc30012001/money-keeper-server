import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { Locale } from 'src/common/enums/common';
import { categoryInitial } from 'src/initial-data/initial-data';
import { IconService } from 'src/modules/icon/icon.service';
import { TransactionService } from 'src/modules/transaction/services/transaction.service';
import { buildTree, TreeNode } from 'src/utils/build-tree';
import { getName } from 'src/utils/common';
import { Category } from '../category.entity';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { FindCategoriesDto } from '../dtos/find-categories.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { UpdateSortOrderDto } from '../dtos/update-sort-order.dto';

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(Category)
		private readonly categoryTreeRepo: TreeRepository<Category>,
		private readonly iconService: IconService,
		private readonly transactionService: TransactionService,
	) {}

	async findAll(
		query: FindCategoriesDto,
		creatorId: string,
	): Promise<PaginatedResponseDto<TreeNode<Category, 'children'>>> {
		// 1. Xây điều kiện filter từ DTO
		const { keyword, type } = query;

		// 2. Lấy toàn bộ categories flat kèm relation parent
		const allCats = await this.categoryTreeRepo.find({
			relations: ['parent', 'icon'],
			order: {
				type: 'ASC',
				sortOrder: 'ASC',
				name: 'ASC',
			},
			where: { creatorId },
		});

		// 3. Tách ra những node THOẢ điều kiện filter
		const matched = allCats.filter((cat) => {
			if (
				keyword &&
				!cat.name.toLowerCase().includes(keyword.toLowerCase())
			) {
				return false;
			}
			if (type?.length && !type.includes(cat.type)) {
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
				p = idToCat.get(p.id)?.parent ?? null;
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
	async findOne(id: string, creatorId: string): Promise<Category> {
		const node = await this.categoryTreeRepo.findOne({
			where: { id, creatorId },
			relations: ['parent', 'icon'],
		});
		if (!node) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}
		const tree = await this.categoryTreeRepo.findDescendantsTree(node, {
			relations: ['parent', 'icon'],
		});
		return tree;
	}

	/** Tạo mới, gán parent nếu có và tự động lưu closure-table */
	async create(dto: CreateCategoryDto, creatorId: string): Promise<Category> {
		// Check duplicate name
		const dup = await this.categoryTreeRepo.findOne({
			where: { name: dto.name, creatorId },
		});
		if (dup) {
			throw new ConflictException(
				`Category '${dto.name}' already exists`,
			);
		}

		// Check parent's type if parent exists
		let parent: Category | undefined;
		if (dto.parentId) {
			const foundParent = await this.categoryTreeRepo.findOne({
				where: { id: dto.parentId, creatorId },
			});
			if (!foundParent) {
				throw new NotFoundException(
					`Parent category ${dto.parentId} not found`,
				);
			}
			if (foundParent.type !== dto.type) {
				throw new BadRequestException(
					`Category's type must match parent's type. Parent has ${foundParent.type} but trying to set ${dto.type}`,
				);
			}
			parent = foundParent;
		}

		const icon = await this.iconService.findOne(dto.iconId);

		const category = this.categoryTreeRepo.create({
			name: dto.name,
			type: dto.type,
			description: dto.description,
			sortOrder: dto.sortOrder,
			icon,
			creatorId,
		});

		if (parent) {
			category.parent = parent;
		}

		const saved = await this.categoryTreeRepo.save(category);
		return this.findOne(saved.id, creatorId);
	}

	/** Cập nhật thông tin và parent */
	async update(
		id: string,
		dto: UpdateCategoryDto,
		creatorId: string,
	): Promise<Category> {
		const category = await this.categoryTreeRepo.findOne({
			where: { id, creatorId },
		});
		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}

		// Đổi tên nếu cần và check duplicate
		if (dto.name && dto.name !== category.name) {
			const dup = await this.categoryTreeRepo.findOne({
				where: { name: dto.name, creatorId },
			});
			if (dup) {
				throw new ConflictException(
					`Category '${dto.name}' already exists`,
				);
			}
			category.name = dto.name;
		}

		// Check type change
		if (dto.type !== undefined && dto.type !== category.type) {
			// Check if has children
			const children =
				await this.categoryTreeRepo.findDescendants(category);
			if (children.length > 1) {
				// includes itself
				throw new BadRequestException(
					'Cannot change type of a category that has children',
				);
			}

			// Check parent's type if parent exists
			if (category.parent) {
				if (category.parent.type !== dto.type) {
					throw new BadRequestException(
						`Category's type must match parent's type. Parent has ${category.parent.type} but trying to set ${dto.type}`,
					);
				}
			}
			category.type = dto.type;
		}

		// Parent: null → gỡ, id → set, undefined → giữ nguyên
		if (dto.parentId !== undefined) {
			if (dto.parentId === null) {
				category.parent = null;
			} else {
				const parent = await this.categoryTreeRepo.findOne({
					where: { id: dto.parentId, creatorId },
				});
				if (!parent) {
					throw new NotFoundException(
						`Parent category ${dto.parentId} not found`,
					);
				}
				// Check if new parent's type matches
				if (parent.type !== category.type) {
					throw new BadRequestException(
						`Category's type must match parent's type. Parent has ${parent.type} but category has ${category.type}`,
					);
				}
				category.parent = parent;
			}
		}

		// icon change
		if (dto.iconId && dto.iconId !== category.icon?.id) {
			const icon = await this.iconService.findOne(dto.iconId);
			category.icon = icon;
		}

		// Cập nhật các thuộc tính khác
		if (dto.description !== undefined)
			category.description = dto.description;
		if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;

		await this.categoryTreeRepo.save(category);
		return this.findOne(id, creatorId);
	}

	/** Xóa node (cascade với cây) */
	async remove(id: string, creatorId: string): Promise<void> {
		const category = await this.categoryTreeRepo.findOne({
			where: { id, creatorId },
		});
		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`);
		}
		await this.transactionService.removeByCategoryId(id, creatorId);
		await this.categoryTreeRepo.remove(category);
	}

	/** Cập nhật sortOrder dùng QueryBuilder hoặc map rồi save lại */
	async updateSortOrder(
		dto: UpdateSortOrderDto,
		creatorId: string,
	): Promise<Category[]> {
		// Tương tự như trước, hoặc bạn có thể
		// load toàn bộ tree rồi set .sortOrder rồi save từng phần
		await this.categoryTreeRepo
			.createQueryBuilder()
			.update(Category)
			.set({
				sortOrder: () =>
					`CASE id ${dto.ids
						.map((id, i) => `WHEN '${id}' THEN ${i + 1}`)
						.join(' ')} END`,
			})
			.where('id IN (:...ids) AND creatorId = :creatorId', {
				ids: dto.ids,
				creatorId,
			})
			.execute();

		// Trả về cây đã sắp xếp lại
		return this.categoryTreeRepo.findTrees();
	}

	async init(creatorId: string, locale: Locale) {
		const data = categoryInitial.map((item) => {
			const { nameVi, nameEn, iconId, children } = item;
			const parentId = uuidv4();
			return this.categoryTreeRepo.create({
				id: parentId,
				name: getName({ nameEn, nameVi, locale }),
				creatorId,
				icon: {
					id: iconId,
				},
				type: item.type,
				children: children?.map((child) =>
					this.categoryTreeRepo.create({
						name: getName({
							nameEn: child.nameEn,
							nameVi: child.nameVi,
							locale,
						}),
						type: item.type,
						icon: {
							id: child.iconId,
						},
						parent: {
							id: parentId,
						},
						creatorId,
					}),
				),
			});
		});
		return this.categoryTreeRepo.save(data);
	}
}

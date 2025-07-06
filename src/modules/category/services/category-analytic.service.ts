/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { buildTree } from 'src/utils/build-tree';
import { getDateRange } from 'src/utils/date';
import { TreeRepository } from 'typeorm';
import { Category } from '../category.entity';
import { CategoryType } from '../category.enum';
import { AnalyticCategoryDto } from '../dtos/analytic-category.dto';

@Injectable()
export class CategoryAnalyticService {
	constructor(
		@InjectRepository(Category)
		private readonly categoryTreeRepo: TreeRepository<Category>,
	) {}

	async getAnalytic(
		type: CategoryType,
		params: AnalyticCategoryDto,
		creatorId: string,
	) {
		const { transactionDate } = params;
		const [from, to] = getDateRange(transactionDate);

		// 1) load all categories of this type, with parent/children
		//    and only those transactions in [from..to]
		const categories = await this.categoryTreeRepo
			.createQueryBuilder('category')
			.leftJoinAndSelect('category.parent', 'parent')
			.leftJoinAndSelect('category.children', 'children')
			.leftJoinAndSelect('category.icon', 'icon')
			.leftJoinAndSelect(
				'category.transaction',
				'transaction',
				'transaction.transactionDate BETWEEN :from AND :to',
				{ from, to },
			)
			.where('category.type = :type', { type })
			.andWhere('category.creatorId = :creatorId', { creatorId })
			.orderBy('category.name', 'ASC')
			.getMany();

		// 2) build the forest
		const trees = buildTree(categories, {
			idKey: 'id',
			parentKey: 'parent',
			childrenKey: 'children',
		});

		// 3) walk each subtree and accumulate sums
		const accumulate = (node: any): number => {
			// sum of this node’s own transactions
			const own = (node.transaction ?? []).reduce(
				(s, tx) => s + Number(tx.amount),
				0,
			);

			// plus all children
			const childrenSum = (node.children ?? [])
				.map(accumulate)
				.reduce((s, c) => s + c, 0);

			node.amount = own + childrenSum;
			return node.amount;
		};

		trees.forEach((root) => accumulate(root));

		// 4) wrap in your existing PaginatedResponseDto
		const total = categories.length;
		const meta = new PaginationMeta({ total, page: 1, pageSize: total });
		return new PaginatedResponseDto(trees, meta);
	}
}

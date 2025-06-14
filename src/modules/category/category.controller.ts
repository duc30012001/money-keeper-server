import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import {
	PaginatedResponseDto,
	ResponseDto,
} from 'src/common/dtos/response.dto';
import { Category } from './category.entity';
import { CategoryType } from './category.enum';
import { AnalyticCategoryDto } from './dtos/analytic-category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { FindCategoriesDto } from './dtos/find-categories.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';
import { CategoryAnalyticService } from './services/category-analytic.service';
import { CategoryService } from './services/category.service';

@ApiTags('Categories')
@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoryController {
	constructor(
		private readonly categoryService: CategoryService,
		private readonly categoryAnalyticService: CategoryAnalyticService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Get all categories' })
	async findAll(
		@Query() query: FindCategoriesDto,
	): Promise<PaginatedResponseDto<Category>> {
		return this.categoryService.findAll(query);
	}

	@Get('analytic/:type')
	@ApiOperation({ summary: 'Get category analytic by type' })
	@ApiParam({
		name: 'type',
		description: 'Category type',
	})
	async getAnalytic(
		@Param('type') type: CategoryType,
		@Query() query: AnalyticCategoryDto,
	) {
		return this.categoryAnalyticService.getAnalytic(type, query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get category by ID' })
	@ApiParam({
		name: 'id',
		description: 'Category ID',
		format: 'uuid',
	})
	async findOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<ResponseDto<Category>> {
		const data = await this.categoryService.findOne(id);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new category' })
	async create(
		@Body() createCategoryDto: CreateCategoryDto,
	): Promise<ResponseDto<Category>> {
		const data = await this.categoryService.create(createCategoryDto);
		return new ResponseDto(data);
	}

	@Patch('sort-order')
	@ApiOperation({ summary: 'Update sort order of all categories' })
	async updateSortOrder(
		@Body() updateSortOrderDto: UpdateSortOrderDto,
	): Promise<ResponseDto<Category[]>> {
		const data =
			await this.categoryService.updateSortOrder(updateSortOrderDto);
		return new ResponseDto(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a category' })
	@ApiParam({
		name: 'id',
		description: 'Category ID',
		format: 'uuid',
	})
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() updateCategoryDto: UpdateCategoryDto,
	): Promise<ResponseDto<Category>> {
		const data = await this.categoryService.update(id, updateCategoryDto);
		return new ResponseDto(data);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a category' })
	@ApiParam({
		name: 'id',
		description: 'Category ID',
		format: 'uuid',
	})
	async remove(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<void> {
		return this.categoryService.remove(id);
	}
}

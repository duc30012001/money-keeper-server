import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseInterceptors,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import {
	PaginatedResponseDto,
	ResponseDto,
} from 'src/common/dtos/response.dto';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

@ApiTags('Categories')
@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	@ApiOperation({ summary: 'Get all categories' })
	async findAll(): Promise<PaginatedResponseDto<Category>> {
		return this.categoryService.findAll();
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

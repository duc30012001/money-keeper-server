import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator';
import { CategoryType } from '../enums/action-type.enum';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
	@ApiProperty({
		description: 'Name of the category',
		example: 'Food & Dining',
		required: false,
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({
		description: 'Icon of the category',
		example: 'food',
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	icon?: string;

	@ApiProperty({
		description: 'Action type of the category',
		enum: CategoryType,
		example: CategoryType.EXPENSE,
		required: false,
	})
	@IsOptional()
	@IsEnum(CategoryType)
	type?: CategoryType;

	@ApiProperty({
		description: 'Description of the category',
		example: 'Expenses related to food and dining',
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Sort order of the category',
		example: 1,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	sortOrder?: number;

	@ApiProperty({
		description: 'Parent category ID',
		example: '550e8400-e29b-41d4-a716-446655440000',
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsUUID('4')
	parentId?: string;
}

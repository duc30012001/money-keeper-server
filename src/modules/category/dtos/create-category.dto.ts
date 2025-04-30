import { ApiProperty } from '@nestjs/swagger';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator';
import { ActionType } from '../enums/action-type.enum';

export class CreateCategoryDto {
	@ApiProperty({
		description: 'Name of the category',
		example: 'Food & Dining',
	})
	@IsNotEmpty()
	@IsString()
	name: string;

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
		enum: ActionType,
		example: ActionType.EXPENSE,
	})
	@IsEnum(ActionType)
	actionType: ActionType;

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
		default: 1,
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

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryType } from '../category.enum';

export class FindCategoriesDto {
	@ApiProperty({
		description: 'Keyword to search in category name',
		example: 'food',
		required: false,
	})
	@IsOptional()
	@IsString()
	keyword?: string;

	@ApiProperty({
		description: 'Action types to filter categories (comma-separated)',
		example: 'expense,income',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }: { value: string | string[] }) => {
		if (typeof value === 'string') {
			return value.split(',').map((type) => type.trim());
		}
		return value;
	})
	@IsArray()
	@IsEnum(CategoryType, { each: true })
	type?: CategoryType[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountTypeDto {
	@ApiProperty({
		description: 'Name of the account type',
		example: 'Savings Account',
	})
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({
		description: 'Description of the account type',
		example: 'A savings account for long-term deposits',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Sort order of the account type',
		example: 1,
		required: false,
		default: 1,
	})
	@IsOptional()
	@IsNumber()
	sortOrder?: number;

	@ApiProperty({
		description: 'Icon ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsNotEmpty()
	@IsString()
	iconId: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class UpdateTransactionDto {
	@ApiPropertyOptional({
		description: 'Account ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	accountId?: string;

	@ApiPropertyOptional({
		description: 'Category ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	categoryId?: string;

	@ApiPropertyOptional({
		description: 'Amount of the transaction',
		example: 1000,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	amount?: number;

	@ApiPropertyOptional({
		description: 'Description of the transaction',
		example: 'This is a description',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		description: 'Transaction date ISO8601 format',
		example: '2021-01-01T00:00:00.000Z',
	})
	@IsOptional()
	@IsDateString()
	transactionDate?: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator';

export class CreateTransactionDto {
	@ApiProperty({
		description: 'Account ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsNotEmpty()
	@IsString()
	accountId: string;

	@ApiProperty({
		description: 'Category ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsNotEmpty()
	@IsString()
	categoryId: string;

	@ApiProperty({
		description: 'Amount of the transaction',
		example: 1000,
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	amount: number;

	@ApiProperty({
		description: 'Description of the transaction',
		example: 'This is a description',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Transaction date ISO8601 format',
		example: '2021-01-01T00:00:00.000Z',
		required: false,
	})
	@IsOptional()
	@IsDateString()
	transactionDate?: Date;
}

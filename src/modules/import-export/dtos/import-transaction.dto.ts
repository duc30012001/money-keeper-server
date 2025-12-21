import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	ValidateNested,
} from 'class-validator';
import { TransactionType } from '../../transaction/transaction.enum';

export class ImportTransactionRowDto {
	@ApiProperty({
		description: 'Transaction date',
		example: '2025-01-15 10:30',
	})
	@IsNotEmpty()
	@IsString()
	date: string;

	@ApiProperty({ description: 'Transaction type', enum: TransactionType })
	@IsEnum(TransactionType)
	type: TransactionType;

	@ApiProperty({ description: 'Amount', example: 1000 })
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	amount: number;

	@ApiProperty({
		description: 'Account name (for income/expense)',
		required: false,
	})
	@IsOptional()
	@IsString()
	account?: string;

	@ApiProperty({
		description: 'Category name (for income/expense)',
		required: false,
	})
	@IsOptional()
	@IsString()
	category?: string;

	@ApiProperty({
		description: 'Sender account name (for transfer)',
		required: false,
	})
	@IsOptional()
	@IsString()
	senderAccount?: string;

	@ApiProperty({
		description: 'Receiver account name (for transfer)',
		required: false,
	})
	@IsOptional()
	@IsString()
	receiverAccount?: string;

	@ApiProperty({ description: 'Description', required: false })
	@IsOptional()
	@IsString()
	description?: string;
}

export class ImportTransactionsDto {
	@ApiProperty({ type: [ImportTransactionRowDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ImportTransactionRowDto)
	rows: ImportTransactionRowDto[];
}

export class ImportResultDto {
	@ApiProperty({
		description: 'Number of successfully imported transactions',
	})
	success: number;

	@ApiProperty({ description: 'Number of failed imports' })
	failed: number;

	@ApiProperty({ description: 'Error details for failed rows' })
	errors: { row: number; message: string }[];
}

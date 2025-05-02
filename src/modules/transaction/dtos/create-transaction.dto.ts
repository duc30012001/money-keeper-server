import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator';
import { TransactionType } from '../transaction.enum';

export class CreateTransactionDto {
	@ApiProperty({
		description: 'Type of the transaction',
		enum: TransactionType,
		example: TransactionType.EXPENSE,
	})
	@IsEnum(TransactionType)
	type: TransactionType;

	@ApiProperty({
		description: 'Account ID (for INCOME or EXPENSE)',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	@ValidateIf(
		(o: CreateTransactionDto) => o.type !== TransactionType.TRANSFER,
	)
	@IsNotEmpty()
	@IsUUID()
	accountId?: string;

	@ApiProperty({
		description: 'Category ID (for INCOME or EXPENSE)',
		example: '123e4567-e89b-12d3-a456-426614174000',
		required: false,
	})
	@ValidateIf(
		(o: CreateTransactionDto) => o.type !== TransactionType.TRANSFER,
	)
	@IsNotEmpty()
	@IsUUID()
	categoryId?: string;

	@ApiProperty({
		description: 'Sender Account ID (when transferring)',
		example: '111e4567-e89b-12d3-a456-426614174001',
		required: false,
	})
	@ValidateIf(
		(o: CreateTransactionDto) => o.type === TransactionType.TRANSFER,
	)
	@IsNotEmpty()
	@IsUUID()
	senderAccountId?: string;

	@ApiProperty({
		description: 'Receiver Account ID (when transferring)',
		example: '222e4567-e89b-12d3-a456-426614174002',
		required: false,
	})
	@ValidateIf(
		(o: CreateTransactionDto) => o.type === TransactionType.TRANSFER,
	)
	@IsNotEmpty()
	@IsUUID()
	receiverAccountId?: string;

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
		example: 'Description of the transaction',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Transaction date ISO8601 format',
		example: '2025-05-02T00:00:00.000Z',
		required: false,
	})
	@IsOptional()
	@IsDateString()
	transactionDate?: Date;
}

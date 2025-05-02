import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateTransactionDto {
	@ApiPropertyOptional({
		description: 'Type of the transaction',
		enum: TransactionType,
		example: TransactionType.EXPENSE,
	})
	@IsOptional()
	@IsEnum(TransactionType)
	type?: TransactionType;

	@ApiPropertyOptional({
		description: 'Account ID (for INCOME or EXPENSE)',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ValidateIf(
		(o: UpdateTransactionDto) =>
			!!o.type && o.type !== TransactionType.TRANSFER,
	)
	@IsOptional()
	@IsNotEmpty()
	@IsUUID()
	accountId?: string;

	@ApiPropertyOptional({
		description: 'Category ID (for INCOME or EXPENSE)',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ValidateIf(
		(o: UpdateTransactionDto) =>
			!!o.type && o.type !== TransactionType.TRANSFER,
	)
	@IsOptional()
	@IsNotEmpty()
	@IsUUID()
	categoryId?: string;

	@ApiPropertyOptional({
		description: 'Sender Account ID (when type=TRANSFER)',
		example: '111e4567-e89b-12d3-a456-426614174001',
	})
	@ValidateIf(
		(o: UpdateTransactionDto) => o.type === TransactionType.TRANSFER,
	)
	@IsOptional()
	@IsNotEmpty()
	@IsUUID()
	senderAccountId?: string;

	@ApiPropertyOptional({
		description: 'Receiver Account ID (when type=TRANSFER)',
		example: '222e4567-e89b-12d3-a456-426614174002',
	})
	@ValidateIf(
		(o: UpdateTransactionDto) => o.type === TransactionType.TRANSFER,
	)
	@IsOptional()
	@IsNotEmpty()
	@IsUUID()
	receiverAccountId?: string;

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
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		description: 'Transaction date ISO8601 format',
		example: '2025-05-02T00:00:00.000Z',
	})
	@IsOptional()
	@IsDateString()
	transactionDate?: Date;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
	CsvDateRange,
	CsvNumberRange,
	CsvUuidArray,
} from 'src/common/decorators/csv.decorators';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';
import { OrderDirection } from 'src/common/enums/common';
import { TransactionOrderBy, TransactionType } from '../transaction.enum';

export class FindTransactionDto extends BaseQueryDto {
	@ApiPropertyOptional({
		description: 'Account IDs to filter accounts (comma-separated)',
		example: '1,2,3',
	})
	@CsvUuidArray()
	accountIds?: string[];

	@ApiPropertyOptional({
		description: 'Category IDs to filter categories (comma-separated)',
		example: '1,2,3',
	})
	@CsvUuidArray()
	categoryIds?: string[];

	@ApiPropertyOptional({
		description: 'Sender Account IDs (comma-separated)',
		example: '1,2,3',
	})
	@CsvUuidArray()
	senderAccountIds?: string[];

	@ApiPropertyOptional({
		description: 'Receiver Account IDs (comma-separated)',
		example: '1,2,3',
	})
	@CsvUuidArray()
	receiverAccountIds?: string[];

	@ApiPropertyOptional({
		description:
			'Transaction date range as two UNIX-ms timestamps, comma-separated',
		example: '1746032400000,1748019600000',
	})
	@CsvDateRange()
	transactionDate?: Date[];

	@ApiPropertyOptional({
		description: 'Amount range as two numbers, comma-separated',
		example: '100000,500000',
	})
	@CsvNumberRange()
	amount?: number[];

	@ApiPropertyOptional({ description: 'Order by', enum: TransactionOrderBy })
	@IsOptional()
	@IsEnum(TransactionOrderBy)
	orderBy?: TransactionOrderBy;

	@ApiPropertyOptional({
		description: 'Order direction',
		enum: OrderDirection,
	})
	@IsOptional()
	@IsEnum(OrderDirection)
	orderDirection?: OrderDirection;

	@ApiPropertyOptional({
		description: 'Transaction type',
		enum: TransactionType,
	})
	@IsOptional()
	@IsEnum(TransactionType)
	type?: TransactionType;
}

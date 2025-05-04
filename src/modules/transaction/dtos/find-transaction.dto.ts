import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import {
	CsvDateRange,
	CsvEnumArray,
	CsvNumberRange,
	CsvUuidArray,
} from 'src/common/decorators/csv.decorators';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';
import { TransactionOrderBy, TransactionType } from '../transaction.enum';

export class FindTransactionSortDto {
	@ApiPropertyOptional({
		description: 'Field to sort by',
		enum: TransactionOrderBy,
		example: TransactionOrderBy.TRANSACTION_DATE,
	})
	@Expose()
	@IsEnum(TransactionOrderBy)
	id: TransactionOrderBy;

	@ApiPropertyOptional({
		description: 'Direction: `true` = descending, `false` = ascending',
		example: true,
	})
	@Expose()
	@IsBoolean()
	desc: boolean;
}

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

	@ApiPropertyOptional({
		description: 'Transaction type, comma-separated',
		example: 'income,expense,transfer',
	})
	@CsvEnumArray(TransactionType)
	type?: TransactionType[];

	@ApiPropertyOptional({
		description: 'Sort order as a JSON array of `{ id, desc }` objects',
		example:
			'[{"id":"transactionDate","desc":true},{"id":"amount","desc":false}]',
		type: [FindTransactionSortDto],
	})
	@Transform(
		({ value }) => {
			if (!value) return undefined;
			try {
				const result = (
					typeof value === 'string' ? JSON.parse(value) : value
				) as FindTransactionSortDto[];
				return result;
			} catch {
				throw new Error(
					'Invalid `sort` parameter: must be a JSON array of { id, desc } objects',
				);
			}
		},
		{ toClassOnly: true },
	)
	@IsOptional()
	// @ValidateNested({ each: true })
	@Type(() => FindTransactionSortDto)
	@ArrayNotEmpty()
	sort?: FindTransactionSortDto[];
}

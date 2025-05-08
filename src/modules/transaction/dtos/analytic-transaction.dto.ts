import { ApiPropertyOptional } from '@nestjs/swagger';

import { ApiProperty } from '@nestjs/swagger';
import {
	CsvDateRange,
	CsvUuidArray,
} from 'src/common/decorators/csv.decorators';

export class AnalyticTransactionDto {
	@ApiProperty({
		description:
			'Transaction date range as two UNIX-ms timestamps, comma-separated',
		example: '1746032400000,1748019600000',
	})
	@CsvDateRange()
	transactionDate?: Date[];

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
}

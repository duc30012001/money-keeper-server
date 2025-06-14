import { ApiProperty } from '@nestjs/swagger';
import { CsvDateRange } from 'src/common/decorators/csv.decorators';

export class AnalyticCategoryDto {
	@ApiProperty({
		description:
			'Transaction date range as two UNIX-ms timestamps, comma-separated',
		example: '1746032400000,1748019600000',
	})
	@CsvDateRange()
	transactionDate?: Date[];
}

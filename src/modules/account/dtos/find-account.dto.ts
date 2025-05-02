import { ApiPropertyOptional } from '@nestjs/swagger';
import { CsvUuidArray } from 'src/common/decorators/csv.decorators';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';

export class FindAccountDto extends BaseQueryDto {
	@ApiPropertyOptional({
		description: 'Account type IDs to filter accounts (comma-separated)',
		example: '1,2,3',
		required: false,
	})
	@CsvUuidArray()
	accountTypeIds?: string[];
}

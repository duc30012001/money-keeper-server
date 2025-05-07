import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CsvUuidArray } from 'src/common/decorators/csv.decorators';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';
import { AccountOrderBy } from '../account.enum';

export class FindAccountSortDto {
	@ApiPropertyOptional({
		description: 'Field to sort by',
		enum: AccountOrderBy,
		example: AccountOrderBy.BALANCE,
	})
	@Expose()
	@IsEnum(AccountOrderBy)
	id: AccountOrderBy;

	@ApiPropertyOptional({
		description: 'Direction: `true` = descending, `false` = ascending',
		example: true,
	})
	@Expose()
	@IsBoolean()
	desc: boolean;
}

export class FindAccountDto extends BaseQueryDto {
	@ApiPropertyOptional({
		description: 'Account type IDs to filter accounts (comma-separated)',
		example: '1,2,3',
		required: false,
	})
	@CsvUuidArray()
	accountTypeIds?: string[];

	@ApiPropertyOptional({
		description: 'Sort order as a JSON array of `{ id, desc }` objects',
		example:
			'[{"id":"transactionDate","desc":true},{"id":"amount","desc":false}]',
		type: [FindAccountSortDto],
	})
	@Transform(
		({ value }) => {
			if (!value) return undefined;
			try {
				const result = (
					typeof value === 'string' ? JSON.parse(value) : value
				) as FindAccountSortDto[];
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
	@Type(() => FindAccountSortDto)
	// @ArrayNotEmpty()
	sort?: FindAccountSortDto[];
}

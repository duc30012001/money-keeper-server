import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';

export class FindAccountDto extends BaseQueryDto {
	@ApiProperty({
		description: 'Account type IDs to filter accounts (comma-separated)',
		example: '1,2,3',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }: { value: string | string[] }) => {
		if (typeof value === 'string') {
			return value.split(',').map((type) => type.trim());
		}
		return value;
	})
	@IsArray()
	@IsUUID(undefined, { each: true })
	accountTypeIds?: string[];
}

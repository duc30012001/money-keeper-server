import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';

export class ListUserDto extends BaseQueryDto {
	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	isActive?: boolean;
}

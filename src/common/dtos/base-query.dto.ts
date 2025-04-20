// src/common/dtos/base-query.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class BaseQueryDto {
	/** Full‑text search keyword */
	@IsOptional()
	@IsString()
	keyword?: string;

	/** 1‑based page number */
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1;

	/** Items per page */
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	pageSize: number = 10;

	/** Number of records to skip */
	get skip(): number {
		return (this.page - 1) * this.pageSize;
	}

	/** Number of records to take */
	get limit(): number {
		return this.pageSize;
	}
}

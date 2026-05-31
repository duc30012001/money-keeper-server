import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';
import { BudgetPeriod } from '../budget.enum';

export class ListBudgetDto extends BaseQueryDto {
	@ApiPropertyOptional({ enum: BudgetPeriod })
	@IsOptional()
	@IsEnum(BudgetPeriod)
	period?: BudgetPeriod;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUUID()
	categoryId?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Min,
} from 'class-validator';
import { BudgetPeriod } from '../budget.enum';

export class CreateBudgetDto {
	@ApiProperty({ example: 'Chi tiêu ăn uống tháng' })
	@IsString()
	name: string;

	@ApiProperty({ enum: BudgetPeriod, example: BudgetPeriod.MONTH })
	@IsEnum(BudgetPeriod)
	period: BudgetPeriod;

	@ApiProperty({ example: 5000000, description: 'Budget amount limit' })
	@IsNumber()
	@Min(0)
	amount: number;

	@ApiPropertyOptional({
		description: 'Category ID (null = total spending budget)',
	})
	@IsOptional()
	@IsUUID()
	categoryId?: string | null;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description?: string | null;
}

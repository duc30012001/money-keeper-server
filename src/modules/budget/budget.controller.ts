import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { Budget } from './budget.entity';
import { BudgetService, BudgetSummaryItem } from './budget.service';
import { CreateBudgetDto } from './dtos/create-budget.dto';
import { ListBudgetDto } from './dtos/list-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetController {
	constructor(private readonly budgetService: BudgetService) {}

	@Get()
	@ApiOperation({ summary: 'Get paginated list of budgets' })
	findAll(@Query() query: ListBudgetDto, @Req() req: Request) {
		return this.budgetService.findAll(query, req.user?.sub as string);
	}

	@Get('summary')
	@ApiOperation({
		summary: 'Get budget summary with spent amounts for current period',
	})
	async getSummary(
		@Req() req: Request,
	): Promise<ResponseDto<BudgetSummaryItem[]>> {
		const data = await this.budgetService.getSummary(
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new budget' })
	async create(
		@Body() dto: CreateBudgetDto,
		@Req() req: Request,
	): Promise<ResponseDto<Budget>> {
		const data = await this.budgetService.create(
			dto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a budget' })
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() dto: UpdateBudgetDto,
		@Req() req: Request,
	): Promise<ResponseDto<Budget>> {
		const data = await this.budgetService.update(
			id,
			dto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a budget' })
	async remove(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Req() req: Request,
	) {
		await this.budgetService.remove(id, req.user?.sub as string);
		return new ResponseDto(null);
	}
}

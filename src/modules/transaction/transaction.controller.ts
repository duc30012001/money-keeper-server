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
	UseInterceptors,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';
import {
	PaginatedResponseDto,
	ResponseDto,
} from 'src/common/dtos/response.dto';
import {
	AnalyticParentCategoryDto,
	AnalyticTransactionByDateDto,
	AnalyticTransactionDto,
} from './dtos/analytic-transaction.dto';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { FindTransactionDto } from './dtos/find-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import {
	AnalyticByParentCategoryResult,
	AnalyticResult,
	ChartResult,
} from './interfaces/transaction.interface';
import { TransactionAnalyticService } from './services/transaction-analytic.service';
import { TransactionService } from './services/transaction.service';
import { Transaction } from './transaction.entity';

@ApiTags('Transactions')
@Controller('transactions')
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
	constructor(
		private readonly transactionService: TransactionService,
		private readonly transactionAnalyticService: TransactionAnalyticService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Get all transactions' })
	async findAll(
		@Query() findTransactionDto: FindTransactionDto,
		@Req() req: Request,
	): Promise<PaginatedResponseDto<Transaction>> {
		return this.transactionService.findAll(
			findTransactionDto,
			req.user?.sub as string,
		);
	}

	@Get('analytics')
	@ApiOperation({ summary: 'Get analytics for transactions' })
	async getAnalytics(
		@Query() analyticTransactionDto: AnalyticTransactionDto,
		@Req() req: Request,
	): Promise<ResponseDto<AnalyticResult>> {
		const data = await this.transactionAnalyticService.getAnalytics(
			analyticTransactionDto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Get('analytics/parent-categories')
	@ApiOperation({ summary: 'Get analytic by parent categories' })
	async getAnalyticParentCategory(
		@Query() queryParams: AnalyticParentCategoryDto,
		@Req() req: Request,
	): Promise<ResponseDto<AnalyticByParentCategoryResult[]>> {
		const data =
			await this.transactionAnalyticService.getAnalyticParentCategory(
				queryParams,
				req.user?.sub as string,
			);
		return new ResponseDto(data);
	}

	@Get('analytics/chart')
	@ApiOperation({ summary: 'Get chart data for transactions' })
	async getChart(
		@Query() queryParams: AnalyticTransactionByDateDto,
		@Req() req: Request,
	): Promise<ResponseDto<ChartResult[]>> {
		const data =
			await this.transactionAnalyticService.getChartIncomeExpense(
				queryParams,
				req.user?.sub as string,
			);
		return new ResponseDto(data);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get transaction by ID' })
	@ApiParam({
		name: 'id',
		description: 'Transaction ID',
		format: 'uuid',
	})
	async findOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Req() req: Request,
	): Promise<ResponseDto<Transaction>> {
		const data = await this.transactionService.findOne(
			id,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new transaction' })
	async create(
		@Body() createTransactionDto: CreateTransactionDto,
		@Req() req: Request,
	): Promise<ResponseDto<Transaction>> {
		const data = await this.transactionService.create(
			createTransactionDto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a transaction' })
	@ApiParam({
		name: 'id',
		description: 'Transaction ID',
		format: 'uuid',
	})
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() updateTransactionDto: UpdateTransactionDto,
		@Req() req: Request,
	): Promise<ResponseDto<Transaction>> {
		const data = await this.transactionService.update(
			id,
			updateTransactionDto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a transaction' })
	@ApiParam({
		name: 'id',
		description: 'Transaction ID',
		format: 'uuid',
	})
	async remove(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Req() req: Request,
	): Promise<void> {
		return this.transactionService.remove(id, req.user?.sub as string);
	}
}

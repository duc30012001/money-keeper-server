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
	UseInterceptors,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import {
	PaginatedResponseDto,
	ResponseDto,
} from 'src/common/dtos/response.dto';
import { AnalyticTransactionDto } from './dtos/analytic-transaction.dto';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { FindTransactionDto } from './dtos/find-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import {
	AnalyticResult,
	ChartResult,
	ExpenseByParentCategoryResult,
	IncomeByParentCategoryResult,
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
	): Promise<PaginatedResponseDto<Transaction>> {
		return this.transactionService.findAll(findTransactionDto);
	}

	@Get('analytics')
	@ApiOperation({ summary: 'Get analytics for transactions' })
	async getAnalytics(
		@Query() analyticTransactionDto: AnalyticTransactionDto,
	): Promise<ResponseDto<AnalyticResult>> {
		const data = await this.transactionAnalyticService.getAnalytics(
			analyticTransactionDto,
		);
		return new ResponseDto(data);
	}

	@Get('chart')
	@ApiOperation({ summary: 'Get chart data for transactions' })
	async getChart(
		@Query() analyticTransactionDto: AnalyticTransactionDto,
	): Promise<ResponseDto<ChartResult[]>> {
		const data =
			await this.transactionAnalyticService.getMonthlyIncomeExpense(
				analyticTransactionDto,
			);
		return new ResponseDto(data);
	}

	@Get('expense-by-parent-categories')
	@ApiOperation({ summary: 'Get expense by parent categories' })
	async getExpenseByParentCategories(
		@Query() analyticTransactionDto: AnalyticTransactionDto,
	): Promise<ResponseDto<ExpenseByParentCategoryResult[]>> {
		const data =
			await this.transactionAnalyticService.getExpenseByParentCategories(
				analyticTransactionDto,
			);
		return new ResponseDto(data);
	}

	@Get('income-by-parent-categories')
	@ApiOperation({ summary: 'Get income by parent categories' })
	async getIncomeByParentCategories(
		@Query() analyticTransactionDto: AnalyticTransactionDto,
	): Promise<ResponseDto<IncomeByParentCategoryResult[]>> {
		const data =
			await this.transactionAnalyticService.getIncomeByParentCategories(
				analyticTransactionDto,
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
	): Promise<ResponseDto<Transaction>> {
		const data = await this.transactionService.findOne(id);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new transaction' })
	async create(
		@Body() createTransactionDto: CreateTransactionDto,
	): Promise<ResponseDto<Transaction>> {
		const data = await this.transactionService.create(createTransactionDto);
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
	): Promise<ResponseDto<Transaction>> {
		const data = await this.transactionService.update(
			id,
			updateTransactionDto,
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
	): Promise<void> {
		return this.transactionService.remove(id);
	}
}

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
import { Account } from './account.entity';
import { CreateAccountDto } from './dtos/create-account.dto';
import { FindAccountDto } from './dtos/find-account.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';
import { AccountBalanceService } from './services/account-balance.service';
import { AccountService } from './services/account.service';

@ApiTags('Accounts')
@Controller('accounts')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
	constructor(
		private readonly accountService: AccountService,
		private readonly accountBalanceService: AccountBalanceService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Get all accounts' })
	async findAll(
		@Query() findAccountDto: FindAccountDto,
		@Req() req: Request,
	): Promise<PaginatedResponseDto<Account>> {
		return this.accountService.findAll(
			findAccountDto,
			req.user?.sub as string,
		);
	}

	@Get('total-balance')
	@ApiOperation({ summary: 'Get total balance of all accounts' })
	async getTotalBalance(@Req() req: Request): Promise<ResponseDto<number>> {
		const data = await this.accountBalanceService.getTotalBalance(
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get account by ID' })
	@ApiParam({
		name: 'id',
		description: 'Account ID',
		format: 'uuid',
	})
	async findOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Req() req: Request,
	): Promise<ResponseDto<Account>> {
		const data = await this.accountService.findOne(
			id,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new account' })
	async create(
		@Body() createAccountDto: CreateAccountDto,
		@Req() req: Request,
	): Promise<ResponseDto<Account>> {
		const data = await this.accountService.create(
			createAccountDto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Patch('sort-order')
	@ApiOperation({ summary: 'Update sort order of all accounts' })
	async updateSortOrder(
		@Body() updateSortOrderDto: UpdateSortOrderDto,
		@Req() req: Request,
	): Promise<ResponseDto<Account[]>> {
		const data = await this.accountService.updateSortOrder(
			updateSortOrderDto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an account' })
	@ApiParam({
		name: 'id',
		description: 'Account ID',
		format: 'uuid',
	})
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() updateAccountDto: UpdateAccountDto,
		@Req() req: Request,
	): Promise<ResponseDto<Account>> {
		const data = await this.accountService.update(
			id,
			updateAccountDto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an account' })
	@ApiParam({
		name: 'id',
		description: 'Account ID',
		format: 'uuid',
	})
	async remove(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Req() req: Request,
	): Promise<void> {
		return this.accountService.remove(id, req.user?.sub as string);
	}
}

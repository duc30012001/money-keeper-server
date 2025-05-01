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
import { Account } from './account.entity';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dtos/create-account.dto';
import { FindAccountDto } from './dtos/find-account.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

@ApiTags('Accounts')
@Controller('accounts')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
	constructor(private readonly accountService: AccountService) {}

	@Get()
	@ApiOperation({ summary: 'Get all account types' })
	async findAll(
		@Query() findAccountDto: FindAccountDto,
	): Promise<PaginatedResponseDto<Account>> {
		return this.accountService.findAll(findAccountDto);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get account type by ID' })
	@ApiParam({
		name: 'id',
		description: 'Account type ID',
		format: 'uuid',
	})
	async findOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<ResponseDto<Account>> {
		const data = await this.accountService.findOne(id);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new account type' })
	async create(
		@Body() createAccountDto: CreateAccountDto,
	): Promise<ResponseDto<Account>> {
		const data = await this.accountService.create(createAccountDto);
		return new ResponseDto(data);
	}

	@Patch('sort-order')
	@ApiOperation({ summary: 'Update sort order of all account types' })
	async updateSortOrder(
		@Body() updateSortOrderDto: UpdateSortOrderDto,
	): Promise<ResponseDto<Account[]>> {
		const data =
			await this.accountService.updateSortOrder(updateSortOrderDto);
		return new ResponseDto(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an account type' })
	@ApiParam({
		name: 'id',
		description: 'Account type ID',
		format: 'uuid',
	})
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() updateAccountDto: UpdateAccountDto,
	): Promise<ResponseDto<Account>> {
		const data = await this.accountService.update(id, updateAccountDto);
		return new ResponseDto(data);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an account type' })
	@ApiParam({
		name: 'id',
		description: 'Account type ID',
		format: 'uuid',
	})
	async remove(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<void> {
		return this.accountService.remove(id);
	}
}

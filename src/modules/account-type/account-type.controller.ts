import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
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
import { AccountType } from './account-type.entity';
import { AccountTypeService } from './account-type.service';
import { CreateAccountTypeDto } from './dtos/create-account-type.dto';
import { UpdateAccountTypeDto } from './dtos/update-account-type.dto';
import { UpdateSortOrderDto } from './dtos/update-sort-order.dto';

@ApiTags('Account Types')
@Controller('account-types')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountTypeController {
	constructor(private readonly accountTypeService: AccountTypeService) {}

	@Get()
	@ApiOperation({ summary: 'Get all account types' })
	async findAll(
		@Req() req: Request,
	): Promise<PaginatedResponseDto<AccountType>> {
		return this.accountTypeService.findAll(req.user?.sub as string);
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
		@Req() req: Request,
	): Promise<ResponseDto<AccountType>> {
		const data = await this.accountTypeService.findOne(
			id,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new account type' })
	async create(
		@Body() createAccountTypeDto: CreateAccountTypeDto,
		@Req() req: Request,
	): Promise<ResponseDto<AccountType>> {
		const data = await this.accountTypeService.create(
			createAccountTypeDto,
			req.user?.sub as string,
		);
		return new ResponseDto(data);
	}

	@Patch('sort-order')
	@ApiOperation({ summary: 'Update sort order of all account types' })
	async updateSortOrder(
		@Body() updateSortOrderDto: UpdateSortOrderDto,
		@Req() req: Request,
	): Promise<ResponseDto<AccountType[]>> {
		const data = await this.accountTypeService.updateSortOrder(
			updateSortOrderDto,
			req.user?.sub as string,
		);
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
		@Body() updateAccountTypeDto: UpdateAccountTypeDto,
		@Req() req: Request,
	): Promise<ResponseDto<AccountType>> {
		const data = await this.accountTypeService.update(
			id,
			updateAccountTypeDto,
			req.user?.sub as string,
		);
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
		@Req() req: Request,
	): Promise<void> {
		return this.accountTypeService.remove(id, req.user?.sub as string);
	}
}

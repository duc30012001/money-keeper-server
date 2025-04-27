import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseInterceptors,
} from '@nestjs/common';

import { ResponseDto } from 'src/common/dtos/response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUserDto } from './dtos/get-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	getList(@Query() query: ListUserDto) {
		return this.userService.getList(query);
	}

	@Get(':id')
	async getOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<ResponseDto<User>> {
		const data = await this.userService.getOneById(id);
		return new ResponseDto(data);
	}

	@Post()
	async create(@Body() dto: CreateUserDto): Promise<ResponseDto<User>> {
		const data = await this.userService.create(dto);
		return new ResponseDto(data);
	}

	@Patch(':id')
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() dto: UpdateUserDto,
	): Promise<ResponseDto<User>> {
		const data = await this.userService.update(id, dto);
		return new ResponseDto(data);
	}
}

import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseInterceptors,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import {
	PaginatedResponseDto,
	ResponseDto,
} from 'src/common/dtos/response.dto';
import { CreateIconDto } from './dtos/create-icon.dto';
import { UpdateIconDto } from './dtos/update-icon.dto';
import { Icon } from './icon.entity';
import { IconService } from './icon.service';

@ApiTags('Icons')
@Controller('icons')
@UseInterceptors(ClassSerializerInterceptor)
export class IconController {
	constructor(private readonly iconService: IconService) {}

	@Get()
	@ApiOperation({ summary: 'Get all icons' })
	async findAll(): Promise<PaginatedResponseDto<Icon>> {
		return this.iconService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get icon by ID' })
	@ApiParam({
		name: 'id',
		description: 'Icon ID',
		format: 'uuid',
	})
	async findOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<ResponseDto<Icon>> {
		const data = await this.iconService.findOne(id);
		return new ResponseDto(data);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new icon' })
	async create(
		@Body() createIconDto: CreateIconDto,
	): Promise<ResponseDto<Icon>> {
		const data = await this.iconService.create(createIconDto);
		return new ResponseDto(data);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an icon' })
	@ApiParam({
		name: 'id',
		description: 'Icon ID',
		format: 'uuid',
	})
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() updateIconDto: UpdateIconDto,
	): Promise<ResponseDto<Icon>> {
		const data = await this.iconService.update(id, updateIconDto);
		return new ResponseDto(data);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an icon' })
	@ApiParam({
		name: 'id',
		description: 'Icon ID',
		format: 'uuid',
	})
	async remove(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<void> {
		return this.iconService.remove(id);
	}
}

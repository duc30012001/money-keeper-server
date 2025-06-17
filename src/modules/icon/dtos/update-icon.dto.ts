import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IconType } from '../enums/icon-type.enum';
import { CreateIconDto } from './create-icon.dto';

export class UpdateIconDto extends PartialType(CreateIconDto) {
	@ApiProperty({
		description: 'Name of the icon',
		example: 'Bank',
		required: false,
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({
		description: 'URL of the icon',
		example: 'https://example.com/icon.png',
		required: false,
	})
	@IsOptional()
	@IsString()
	url?: string;

	@ApiProperty({
		description: 'Type of the icon',
		example: 'income',
		required: false,
	})
	@IsOptional()
	@IsEnum(IconType)
	type?: IconType;
}

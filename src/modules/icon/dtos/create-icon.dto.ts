import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIconDto {
	@ApiProperty({
		description: 'Name of the icon',
		example: 'Savings Account',
	})
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({
		description: 'URL of the icon',
		example: 'https://example.com/icon.png',
	})
	@IsNotEmpty()
	@IsString()
	url: string;

	@ApiProperty({
		description: 'Type of the icon',
		example: 'income',
	})
	@IsString()
	type: string;
}

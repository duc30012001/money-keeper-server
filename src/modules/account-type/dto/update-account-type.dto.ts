import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateAccountTypeDto } from './create-account-type.dto';

export class UpdateAccountTypeDto extends PartialType(CreateAccountTypeDto) {
	@ApiProperty({
		description: 'Name of the account type',
		example: 'Savings Account',
		required: false,
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({
		description: 'Description of the account type',
		example: 'A savings account for long-term deposits',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Sort order of the account type',
		example: 1,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	sortOrder?: number;
}

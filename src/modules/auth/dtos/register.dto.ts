import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/common/enums/common';

export class RegisterDto {
	@ApiProperty({
		description: 'User email',
		example: 'user@example.com',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'User password',
		example: 'password123',
	})
	@IsString()
	password: string;

	@ApiPropertyOptional({
		description: 'Locale',
		example: 'en',
	})
	@IsOptional()
	@IsEnum(Locale)
	locale?: Locale;
}

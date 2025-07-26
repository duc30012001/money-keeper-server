import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';
import { Locale } from 'src/common/enums/common';
import { UserRole } from '../user.enum';

export class CreateUserDto {
	@ApiProperty({
		description: 'User email',
		example: 'user@example.com',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'User password (min 6 characters)',
		example: 'password123',
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	password: string;

	@ApiProperty({
		description: 'Whether the user is active',
		example: true,
		required: false,
		default: true,
	})
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@ApiProperty({
		description: 'User roles',
		example: UserRole.USER,
		required: false,
		default: UserRole.USER,
		enum: UserRole,
	})
	@IsEnum(UserRole)
	@IsOptional()
	role?: UserRole;

	@ApiPropertyOptional({
		description: 'Locale',
		example: 'en',
	})
	@IsOptional()
	@IsEnum(Locale)
	locale?: Locale;
}

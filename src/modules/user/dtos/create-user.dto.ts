import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
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

	@ApiPropertyOptional({
		description: 'Firebase UID',
	})
	@IsOptional()
	@IsString()
	firebaseUid?: string;

	@ApiPropertyOptional({
		description: 'Display name',
	})
	@IsOptional()
	@IsString()
	displayName?: string;

	@ApiPropertyOptional({
		description: 'Photo URL',
	})
	@IsOptional()
	@IsString()
	photoUrl?: string;

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

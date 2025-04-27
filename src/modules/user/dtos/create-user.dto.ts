import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsBoolean,
	IsEmail,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

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
		example: ['user', 'admin'],
		required: false,
		default: ['user'],
		type: [String],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	roles?: string[];
}

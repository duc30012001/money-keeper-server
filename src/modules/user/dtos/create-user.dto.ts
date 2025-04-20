import {
	IsArray,
	IsBoolean,
	IsEmail,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	password: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	roles?: string[];
}

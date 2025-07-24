import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

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
}

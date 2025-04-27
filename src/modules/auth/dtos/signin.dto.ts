import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
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

export class GetTokenResponse {
	@ApiProperty({
		description: 'JWT access token',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	accessToken: string;

	@ApiProperty({
		description: 'JWT refresh token',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	refreshToken: string;

	constructor(accessToken: string, refreshToken: string) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}
}

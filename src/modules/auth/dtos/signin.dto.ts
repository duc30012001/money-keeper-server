import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}

export class GetTokenResponse {
	accessToken: string;
	refreshToken: string;

	constructor(accessToken: string, refreshToken: string) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}
}

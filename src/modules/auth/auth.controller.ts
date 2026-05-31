import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { FirebaseSigninDto } from './dtos/firebase-signin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Get('me')
	@ApiOperation({ summary: 'Get current user information' })
	async me(@Req() req: Request): Promise<ResponseDto<User>> {
		const data = await this.auth.me(req);
		return new ResponseDto(data);
	}

	@Public()
	@Post('firebase-signin')
	@ApiOperation({ summary: 'Sign in with Firebase ID token' })
	async firebaseSignin(
		@Body() dto: FirebaseSigninDto,
	): Promise<ResponseDto<User>> {
		const data = await this.auth.signinWithFirebase(dto);
		return new ResponseDto(data);
	}
}

import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { RefreshDto } from './dtos/refresh-token.dto';
import { GetTokenResponse, SigninDto } from './dtos/signin.dto';

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
	@Post('signin')
	@ApiOperation({ summary: 'Sign in with email and password' })
	async signin(
		@Body() dto: SigninDto,
	): Promise<ResponseDto<GetTokenResponse>> {
		const data = await this.auth.signin(dto);
		return new ResponseDto(data);
	}

	@Public()
	@Post('refresh')
	@ApiOperation({ summary: 'Refresh access token using refresh token' })
	async refresh(
		@Body() dto: RefreshDto,
	): Promise<ResponseDto<GetTokenResponse>> {
		const data = await this.auth.refresh(dto);
		return new ResponseDto(data);
	}
}

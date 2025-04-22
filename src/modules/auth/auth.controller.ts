import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { RefreshDto } from './dtos/refresh-token.dto';
import { GetTokenResponse, SigninDto } from './dtos/signin.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Get('me')
	async me(@Req() req: Request): Promise<ResponseDto<User>> {
		const data = await this.auth.me(req);
		return new ResponseDto(data);
	}

	@Public()
	@Post('signin')
	async signin(
		@Body() dto: SigninDto,
	): Promise<ResponseDto<GetTokenResponse>> {
		const data = await this.auth.signin(dto);
		return new ResponseDto(data);
	}

	@Public()
	@Post('refresh')
	async refresh(
		@Body() dto: RefreshDto,
	): Promise<ResponseDto<GetTokenResponse>> {
		const data = await this.auth.refresh(dto);
		return new ResponseDto(data);
	}
}

import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { AuthService } from './auth.service';
import { RefreshDto } from './dtos/refresh-token.dto';
import { GetTokenResponse, SigninDto } from './dtos/signin.dto';

@Public()
@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Post('signin')
	async signin(
		@Body() dto: SigninDto,
	): Promise<ResponseDto<GetTokenResponse>> {
		const data = await this.auth.signin(dto);
		return new ResponseDto(data);
	}

	@Post('refresh')
	async refresh(
		@Body() dto: RefreshDto,
	): Promise<ResponseDto<GetTokenResponse>> {
		const data = await this.auth.refresh(dto);
		return new ResponseDto(data);
	}
}

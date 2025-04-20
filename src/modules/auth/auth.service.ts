// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthMessages } from 'src/common/messages';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../user/user.service';
import { RefreshDto } from './dtos/refresh-token.dto';
import { GetTokenResponse, SigninDto } from './dtos/signin.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwt: JwtService,
	) {}

	/** If you handle signup here, hash with Argon2 */
	async signup(email: string, password: string) {
		const hash = await argon2.hash(password);
		return this.userService.create({ email, password: hash });
	}

	/** Validate credentials and issue tokens */
	async signin(dto: SigninDto) {
		const user = await this.userService.getOneByEmail(dto.email);
		if (!user)
			throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);

		const valid = await argon2.verify(user.password, dto.password);
		if (!valid)
			throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);

		const payload = { sub: user.id, email: user.email };
		const accessToken = await this.jwt.generateAccessToken(payload);
		const refreshToken = await this.jwt.generateRefreshToken(payload);

		return new GetTokenResponse(accessToken, refreshToken);
	}

	/** Verify the refresh token, then issue a new access (and refresh) token */
	async refresh(dto: RefreshDto) {
		let payload: JwtPayload;
		try {
			payload = await this.jwt.verifyTokenAsync(dto.refreshToken);
		} catch {
			throw new UnauthorizedException('Invalid or expired refresh token');
		}

		// Optionally verify the user still exists / hasn’t been disabled
		const user = await this.userService.getOneById(payload.sub);
		if (!user) {
			throw new UnauthorizedException('User no longer exists');
		}

		const newAccess = await this.jwt.generateAccessToken({
			sub: user.id,
			email: user.email,
		});
		const newRefresh = await this.jwt.generateRefreshToken({
			sub: user.id,
			email: user.email,
		});

		return new GetTokenResponse(newAccess, newRefresh);
	}
}

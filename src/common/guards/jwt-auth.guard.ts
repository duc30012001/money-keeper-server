// src/common/guards/jwt-auth.guard.ts
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthMessages } from '../messages';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// 1) Skip if @Public() is set on the handler or controller
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (isPublic) return true;

		// 2) Otherwise enforce JWT
		const req = context.switchToHttp().getRequest<Request>();
		const authHeader = req.headers['authorization'];

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new UnauthorizedException(AuthMessages.MISSING_AUTH_HEADER);
		}

		const token = authHeader.replace('Bearer ', '').trim();

		try {
			const payload = await this.jwtService.verifyTokenAsync(token);
			// attach decoded payload to request.user
			req['user'] = payload;
			return true;
		} catch (err) {
			throw new UnauthorizedException(
				err || AuthMessages.INVALID_OR_EXPIRED_TOKEN,
			);
		}
	}
}

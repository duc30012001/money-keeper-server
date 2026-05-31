import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { FirebaseAuthService } from 'src/modules/firebase/firebase-auth.service';
import { User } from 'src/modules/user/user.entity';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthMessages } from '../messages';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
	constructor(
		private readonly firebaseAuth: FirebaseAuthService,
		private readonly reflector: Reflector,
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// 1) Skip if @Public() is set on the handler or controller
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (isPublic) return true;

		// 2) Otherwise enforce Firebase ID Token
		const req = context.switchToHttp().getRequest<Request>();
		const authHeader = req.headers['authorization'];

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new UnauthorizedException(AuthMessages.MISSING_AUTH_HEADER);
		}

		const token = authHeader.replace('Bearer ', '').trim();

		try {
			const firebaseUser = await this.firebaseAuth.verifyIdToken(token);

			// Resolve internal user by Firebase UID
			const user = await this.userRepo.findOne({
				where: { firebaseUid: firebaseUser.uid },
				select: {
					id: true,
					email: true,
					firebaseUid: true,
					isActive: true,
				},
			});

			if (!user || !user.isActive) {
				throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
			}

			// Attach payload compatible with existing controllers (req.user.sub)
			req['user'] = {
				sub: user.id,
				firebaseUid: firebaseUser.uid,
				email: firebaseUser.email,
			};
			return true;
		} catch (err) {
			if (err instanceof UnauthorizedException) throw err;
			throw new UnauthorizedException(
				AuthMessages.INVALID_OR_EXPIRED_TOKEN,
			);
		}
	}
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthMessages } from 'src/common/messages';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { UserService } from '../user/user.service';
import { FirebaseSigninDto } from './dtos/firebase-signin.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly firebaseAuth: FirebaseAuthService,
	) {}

	/** Verify Firebase ID token, find or create user, return user data */
	async signinWithFirebase(dto: FirebaseSigninDto) {
		const firebaseUser = await this.firebaseAuth.verifyIdToken(dto.idToken);

		const user = await this.userService.findOrCreateByFirebase(
			firebaseUser,
			dto.locale,
		);

		if (!user.isActive) {
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}

		return user;
	}

	async me(req: Request) {
		const firebaseUid = req.user?.firebaseUid;

		if (!firebaseUid) {
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}

		const user = await this.userService.getOneByFirebaseUid(firebaseUid);
		if (!user.isActive) {
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}

		return user;
	}
}

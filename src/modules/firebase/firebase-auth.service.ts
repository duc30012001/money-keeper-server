import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthMessages } from 'src/common/messages';
import { firebaseAuth } from 'src/config/firebase.config';

export interface FirebaseUser {
	uid: string;
	email: string;
	displayName?: string;
	photoURL?: string;
}

@Injectable()
export class FirebaseAuthService {
	/** Verify a Firebase ID token and return decoded user info */
	async verifyIdToken(idToken: string): Promise<FirebaseUser> {
		try {
			const decoded = await firebaseAuth.verifyIdToken(idToken);
			return {
				uid: decoded.uid,
				email: decoded.email ?? '',
				displayName: decoded.name,
				photoURL: decoded.picture,
			};
		} catch {
			throw new UnauthorizedException(
				AuthMessages.INVALID_OR_EXPIRED_TOKEN,
			);
		}
	}
}

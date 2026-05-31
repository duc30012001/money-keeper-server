import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
	providers: [FirebaseAuthService],
	exports: [FirebaseAuthService],
})
export class FirebaseModule {}

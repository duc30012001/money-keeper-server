import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FirebaseModule } from '../firebase/firebase.module';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		ConfigModule,
		UserModule,
		FirebaseModule,
		TypeOrmModule.forFeature([User]),
	],
	providers: [AuthService, FirebaseAuthGuard],
	controllers: [AuthController],
	exports: [FirebaseAuthGuard],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtModule } from '../jwt/jwt.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [ConfigModule, UserModule, JwtModule],
	providers: [AuthService, JwtAuthGuard],
	controllers: [AuthController],
	exports: [JwtAuthGuard],
})
export class AuthModule {}

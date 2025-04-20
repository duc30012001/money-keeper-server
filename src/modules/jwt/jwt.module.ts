import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtModule as NestJwtModule } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { JwtConfig } from 'src/common/types/config.interface';
import { JwtService } from './jwt.service';

@Module({
	imports: [
		ConfigModule,
		NestJwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService): JwtModuleOptions => {
				const jwt = config.get('jwt') as JwtConfig;
				return {
					privateKey: jwt.privateKey,
					publicKey: jwt.publicKey,
					signOptions: {
						algorithm: jwt.algorithm as jwt.Algorithm,
						expiresIn: jwt.accessTokenExpiresIn,
					},
					verifyOptions: {
						algorithms: [jwt.algorithm as jwt.Algorithm],
					},
				};
			},
		}),
	],
	providers: [JwtService],
	exports: [JwtService],
})
export class JwtModule {}

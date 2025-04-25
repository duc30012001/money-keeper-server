import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { InitService } from './init.service';

@Module({
	imports: [ConfigModule, UserModule],
	providers: [InitService],
})
export class InitModule {}

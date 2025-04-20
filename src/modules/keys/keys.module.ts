import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeysController } from './keys.controller';

@Module({
	imports: [ConfigModule],
	controllers: [KeysController],
})
export class KeysModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconController } from './icon.controller';
import { Icon } from './icon.entity';
import { IconService } from './icon.service';

@Module({
	imports: [TypeOrmModule.forFeature([Icon])],
	controllers: [IconController],
	providers: [IconService],
	exports: [IconService],
})
export class IconModule {}

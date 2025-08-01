import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTypeModule } from '../account-type/account-type.module';
import { AccountModule } from '../account/account.module';
import { CategoryModule } from '../category/category.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		AccountTypeModule,
		CategoryModule,
		AccountModule,
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}

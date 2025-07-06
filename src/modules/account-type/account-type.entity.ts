import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Entity, OneToMany, RelationCount, Unique } from 'typeorm';

import { BaseCreatorEntity } from 'src/common/entities/base-creator.entity';
import { Account } from '../account/account.entity';

@Entity('account_types')
@Unique(['name'])
export class AccountType extends BaseCreatorEntity {
	@Column({ name: 'name' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({ name: 'description', nullable: true, type: 'varchar' })
	@IsOptional()
	@IsString()
	description: string | null;

	@Column({ name: 'sort_order', type: 'int', default: 1 })
	@IsNumber()
	sortOrder: number;

	@OneToMany(() => Account, (account) => account.accountType)
	accounts: Account[];

	// this will be filled in with the count of `accounts`
	@RelationCount((at: AccountType) => at.accounts)
	accountCount: number;
}

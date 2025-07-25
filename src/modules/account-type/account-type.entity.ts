import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	RelationCount,
} from 'typeorm';

import { BaseCreatorEntity } from 'src/common/entities/base-creator.entity';
import { Account } from '../account/account.entity';
import { Icon } from '../icon/icon.entity';

@Entity('account_types')
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

	@ManyToOne(() => Icon)
	@JoinColumn({ name: 'icon_id' })
	icon: Icon;

	@OneToMany(() => Account, (account) => account.accountType)
	accounts: Account[];

	// this will be filled in with the count of `accounts`
	@RelationCount((at: AccountType) => at.accounts)
	accountCount: number;
}

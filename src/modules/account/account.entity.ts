import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AccountType } from '../account-type/account-type.entity';
import { Icon } from '../icon/icon.entity';

@Entity('accounts')
export class Account extends BaseEntity {
	@Column({ name: 'name', unique: true })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({ name: 'description', nullable: true, type: 'varchar' })
	@IsOptional()
	@IsString()
	description: string | null;

	@Column({
		name: 'initial_balance',
		type: 'decimal',
		precision: 18,
		// scale: 2,
		default: '0',
	})
	// @IsNumber()
	initialBalance: string;

	@Column({
		name: 'balance',
		type: 'decimal',
		precision: 18,
		// scale: 2,
		default: '0',
	})
	// @IsNumber()
	balance: string;

	@Column({ name: 'sort_order', type: 'int', default: 1 })
	@IsNumber()
	sortOrder: number;

	@ManyToOne(() => AccountType)
	@JoinColumn({ name: 'account_type_id' })
	accountType: AccountType;

	@ManyToOne(() => Icon)
	@JoinColumn({ name: 'icon_id' })
	icon: Icon;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AccountType } from '../account-type/account-type.entity';

@Entity('accounts')
export class Account extends BaseEntity {
	@Column({ name: 'name' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({ name: 'description', nullable: true, type: 'varchar' })
	@IsOptional()
	@IsString()
	description: string | null;

	@Column({ name: 'balance', type: 'float', default: 0 })
	@IsNumber()
	balance: number;

	@Column({ name: 'sort_order', type: 'int', default: 1 })
	@IsNumber()
	sortOrder: number;

	@ManyToOne(() => AccountType)
	@JoinColumn({ name: 'account_type_id' })
	accountType: AccountType;
}

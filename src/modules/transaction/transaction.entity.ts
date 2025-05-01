import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
	@ManyToOne(() => Account)
	@JoinColumn({ name: 'account_id' })
	account: Account;

	@ManyToOne(() => Category)
	@JoinColumn({ name: 'category_id' })
	category: Category;

	@Column({
		name: 'amount',
		type: 'decimal',
		precision: 18,
		// scale: 2,
	})
	@IsNumber()
	amount: number;

	@Column({ name: 'description', type: 'text', nullable: true })
	@IsOptional()
	@IsString()
	description: string | null;

	@Column({
		name: 'transaction_date',
		type: 'timestamptz',
		default: () => 'CURRENT_TIMESTAMP',
	})
	transactionDate: Date;
}

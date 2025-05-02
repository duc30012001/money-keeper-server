import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { TransactionType } from './transaction.enum';

@Entity('transactions')
export class Transaction extends BaseEntity {
	@Column({
		name: 'type',
		type: 'enum',
		enum: TransactionType,
	})
	@IsEnum(TransactionType)
	type: TransactionType;

	@ManyToOne(() => Account, { nullable: true })
	@JoinColumn({ name: 'account_id' })
	account?: Account;

	@ManyToOne(() => Account, { nullable: true })
	@JoinColumn({ name: 'sender_account_id' })
	senderAccount?: Account;

	@ManyToOne(() => Account, { nullable: true })
	@JoinColumn({ name: 'receiver_account_id' })
	receiverAccount?: Account;

	@ManyToOne(() => Category, { nullable: true })
	@JoinColumn({ name: 'category_id' })
	category?: Category;

	@Column('decimal', { name: 'amount', precision: 18, scale: 2 })
	@IsNumber()
	amount: number;

	@Column({ name: 'description', type: 'text', nullable: true })
	@IsOptional()
	@IsString()
	description?: string | null;

	@Column({
		name: 'transaction_date',
		type: 'timestamptz',
		default: () => 'CURRENT_TIMESTAMP',
	})
	transactionDate: Date;
}

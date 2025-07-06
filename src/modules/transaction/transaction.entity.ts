import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCreatorEntity } from 'src/common/entities/base-creator.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { TransactionType } from './transaction.enum';

@Entity('transactions')
export class Transaction extends BaseCreatorEntity {
	@Column({
		name: 'type',
		type: 'enum',
		enum: TransactionType,
	})
	@IsEnum(TransactionType)
	type: TransactionType;

	// ─── Sender Account ────────────────────────────────
	@ManyToOne(() => Account, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'sender_account_id' })
	senderAccount: Account | null;

	// ─── Receiver Account ─────────────────────────────
	@ManyToOne(() => Account, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'receiver_account_id' })
	receiverAccount: Account | null;

	// ─── Account ───────────────────────────────────────
	@ManyToOne(() => Account, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'account_id' })
	account: Account | null;

	// ─── Category ─────────────────────────────────────
	@ManyToOne(() => Category, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'category_id' })
	category: Category | null;

	// ─── Amount, Description, Date ────────────────────

	@Column('decimal', {
		name: 'amount',
		precision: 18,
		scale: 2,
	})
	@IsNumber()
	amount: number;

	@Column({
		name: 'description',
		type: 'text',
		nullable: true,
	})
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { calculateBalance } from 'src/utils/balance';
import { EntityManager, Repository } from 'typeorm';
import { CategoryType } from '../../category/category.enum';
import { Account } from '../account.entity';

@Injectable()
export class AccountBalanceService {
	constructor(
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>,
	) {}

	/**
	 * Update an account’s balance within an existing transaction.
	 * Pass in a manager to enable support for rollback.
	 */
	async updateBalance(
		id: string,
		amount: number,
		type: CategoryType,
		manager: EntityManager,
	): Promise<Account> {
		const repo = manager.getRepository(Account);

		const account = await repo.findOne({ where: { id } });
		if (!account) {
			throw new NotFoundException(`Account with ID ${id} not found`);
		}

		account.balance = calculateBalance(
			account.balance,
			amount,
			type,
		).toString();

		return repo.save(account);
	}

	async getTotalBalance(): Promise<number> {
		const accounts = await this.accountRepository.find({
			select: ['balance'],
		});
		return accounts.reduce(
			(acc, account) => acc + Number(account.balance),
			0,
		);
	}
}

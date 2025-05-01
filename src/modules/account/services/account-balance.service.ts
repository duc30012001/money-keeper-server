import { Injectable, NotFoundException } from '@nestjs/common';
import { calculateBalance } from 'src/utils/balance';
import { EntityManager } from 'typeorm';
import { ActionType } from '../../category/enums/action-type.enum';
import { Account } from '../account.entity';

@Injectable()
export class AccountBalanceService {
	/**
	 * Update an account’s balance within an existing transaction.
	 * Pass in a manager to enable support for rollback.
	 */
	async updateBalance(
		id: string,
		amount: number,
		actionType: ActionType,
		manager: EntityManager,
	): Promise<Account> {
		const repo = manager.getRepository(Account);

		const account = await repo.findOne({ where: { id } });
		if (!account) {
			throw new NotFoundException(`Account with ID ${id} not found`);
		}

		account.balance = calculateBalance(account.balance, amount, actionType);

		return repo.save(account);
	}
}

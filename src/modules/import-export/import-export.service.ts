import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Repository, TreeRepository } from 'typeorm';

import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { CreateTransactionDto } from '../transaction/dtos/create-transaction.dto';
import { TransactionService } from '../transaction/services/transaction.service';
import { TransactionType } from '../transaction/transaction.enum';
import {
	ImportResultDto,
	ImportTransactionRowDto,
} from './dtos/import-transaction.dto';

@Injectable()
export class ImportExportService {
	constructor(
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>,
		@InjectRepository(Category)
		private readonly categoryRepository: TreeRepository<Category>,
		private readonly transactionService: TransactionService,
	) {}

	async importTransactions(
		rows: ImportTransactionRowDto[],
		creatorId: string,
	): Promise<ImportResultDto> {
		const result: ImportResultDto = {
			success: 0,
			failed: 0,
			errors: [],
		};

		// Pre-fetch all accounts and categories for name lookup
		const accounts = await this.accountRepository.find({
			where: { creatorId },
		});
		const categories = await this.categoryRepository.find({
			where: { creatorId },
		});

		const accountMap = new Map(accounts.map((a) => [a.name, a.id]));
		// Category map includes both prefixed and non-prefixed names for flexibility
		const categoryMap = new Map<string, string>();
		categories.forEach((c) => {
			categoryMap.set(c.name, c.id);
			// Also map the prefixed version
			const prefix = `[${c.type}] `;
			categoryMap.set(`${prefix}${c.name}`, c.id);
		});

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			try {
				const dto = this.mapRowToDto(row, accountMap, categoryMap, i);
				await this.transactionService.create(dto, creatorId);
				result.success++;
			} catch (error) {
				result.failed++;
				result.errors.push({
					row: i + 1,
					message:
						error instanceof Error
							? error.message
							: 'Unknown error',
				});
			}
		}

		return result;
	}

	private mapRowToDto(
		row: ImportTransactionRowDto,
		accountMap: Map<string, string>,
		categoryMap: Map<string, string>,
		rowIndex: number,
	): CreateTransactionDto {
		// Parse date
		const transactionDate = this.parseDate(row.date);

		if (row.type === TransactionType.TRANSFER) {
			// Transfer transaction
			const senderAccountId = accountMap.get(row.senderAccount || '');
			const receiverAccountId = accountMap.get(row.receiverAccount || '');

			if (!senderAccountId) {
				throw new Error(
					`Row ${rowIndex + 1}: Sender account "${row.senderAccount}" not found`,
				);
			}
			if (!receiverAccountId) {
				throw new Error(
					`Row ${rowIndex + 1}: Receiver account "${row.receiverAccount}" not found`,
				);
			}

			return {
				type: TransactionType.TRANSFER,
				amount: row.amount,
				senderAccountId,
				receiverAccountId,
				description: row.description,
				transactionDate,
			};
		} else {
			// Income/Expense transaction
			const accountId = accountMap.get(row.account || '');
			const categoryId = categoryMap.get(row.category || '');

			if (!accountId) {
				throw new Error(
					`Row ${rowIndex + 1}: Account "${row.account}" not found`,
				);
			}
			if (!categoryId) {
				throw new Error(
					`Row ${rowIndex + 1}: Category "${row.category}" not found`,
				);
			}

			return {
				type: row.type,
				amount: row.amount,
				accountId,
				categoryId,
				description: row.description,
				transactionDate,
			};
		}
	}

	private parseDate(dateStr: string): Date {
		// Handle YYYY-MM-DD HH:mm format
		const [datePart, timePart] = dateStr.split(' ');
		const [year, month, day] = datePart.split('-').map(Number);
		const [hours, minutes] = (timePart || '00:00').split(':').map(Number);
		return new Date(year, month - 1, day, hours, minutes);
	}

	async generateTemplate(creatorId: string): Promise<ExcelJS.Buffer> {
		const workbook = new ExcelJS.Workbook();
		workbook.creator = 'Money Keeper';
		workbook.created = new Date();

		const worksheet = workbook.addWorksheet('Transactions');

		// Define columns
		worksheet.columns = [
			{ header: 'Date', key: 'date', width: 18 },
			{ header: 'Type', key: 'type', width: 12 },
			{ header: 'Amount', key: 'amount', width: 15 },
			{ header: 'Account', key: 'account', width: 20 },
			{ header: 'Category', key: 'category', width: 20 },
			{ header: 'Sender Account', key: 'senderAccount', width: 20 },
			{ header: 'Receiver Account', key: 'receiverAccount', width: 20 },
			{ header: 'Description', key: 'description', width: 30 },
		];

		// Style header row
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFE0E0E0' },
		};

		// Fetch user's accounts and categories for dropdowns
		const accounts = await this.accountRepository.find({
			where: { creatorId },
			order: { name: 'ASC' },
		});

		const categories = await this.categoryRepository.find({
			where: { creatorId },
			order: { type: 'ASC', name: 'ASC' },
		});

		// Create dropdown lists on a hidden sheet
		const dropdownSheet = workbook.addWorksheet('Dropdowns');
		dropdownSheet.state = 'veryHidden';

		// Transaction types
		const transactionTypes = [
			TransactionType.INCOME,
			TransactionType.EXPENSE,
			TransactionType.TRANSFER,
		];
		transactionTypes.forEach((type, index) => {
			dropdownSheet.getCell(`A${index + 1}`).value = type;
		});

		// Account names
		accounts.forEach((account, index) => {
			dropdownSheet.getCell(`B${index + 1}`).value = account.name;
		});

		// Category names with type prefix
		categories.forEach((category, index) => {
			const prefix = `[${category.type}] `;
			dropdownSheet.getCell(`C${index + 1}`).value =
				`${prefix}${category.name}`;
		});

		// Apply data validation to columns (for rows 2-1000)
		const dataRowStart = 2;
		const dataRowEnd = 1000;

		for (let row = dataRowStart; row <= dataRowEnd; row++) {
			// Type dropdown (column B)
			worksheet.getCell(`B${row}`).dataValidation = {
				type: 'list',
				allowBlank: true,
				formulae: [`Dropdowns!$A$1:$A$${transactionTypes.length}`],
				showErrorMessage: true,
				errorTitle: 'Invalid Type',
				error: 'Please select a valid transaction type',
			};

			// Account dropdown (column D) - for Income/Expense
			if (accounts.length > 0) {
				worksheet.getCell(`D${row}`).dataValidation = {
					type: 'list',
					allowBlank: true,
					formulae: [`Dropdowns!$B$1:$B$${accounts.length}`],
					showErrorMessage: true,
					errorTitle: 'Invalid Account',
					error: 'Please select a valid account',
				};
			}

			// Category dropdown (column E)
			if (categories.length > 0) {
				worksheet.getCell(`E${row}`).dataValidation = {
					type: 'list',
					allowBlank: true,
					formulae: [`Dropdowns!$C$1:$C$${categories.length}`],
					showErrorMessage: true,
					errorTitle: 'Invalid Category',
					error: 'Please select a valid category',
				};
			}

			// From Account dropdown (column F) - for Transfer
			if (accounts.length > 0) {
				worksheet.getCell(`F${row}`).dataValidation = {
					type: 'list',
					allowBlank: true,
					formulae: [`Dropdowns!$B$1:$B$${accounts.length}`],
					showErrorMessage: true,
					errorTitle: 'Invalid Account',
					error: 'Please select a valid account',
				};
			}

			// To Account dropdown (column G) - for Transfer
			if (accounts.length > 0) {
				worksheet.getCell(`G${row}`).dataValidation = {
					type: 'list',
					allowBlank: true,
					formulae: [`Dropdowns!$B$1:$B$${accounts.length}`],
					showErrorMessage: true,
					errorTitle: 'Invalid Account',
					error: 'Please select a valid account',
				};
			}

			// Date format validation (column A)
			worksheet.getCell(`A${row}`).numFmt = 'yyyy-mm-dd hh:mm';
		}

		// Add sample row with today's date and time
		const now = new Date();
		const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
		worksheet.getCell('A2').value = formattedDate;

		return workbook.xlsx.writeBuffer();
	}
}

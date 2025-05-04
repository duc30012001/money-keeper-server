import { CategoryType } from 'src/modules/category/category.enum';

export const calculateBalance = (
	currentBalance: number,
	amount: number,
	type: CategoryType,
) => {
	switch (type) {
		case CategoryType.INCOME:
			return Number(currentBalance) + Number(amount);
		case CategoryType.EXPENSE:
			return Number(currentBalance) - Number(amount);
		default:
			return Number(currentBalance);
	}
};

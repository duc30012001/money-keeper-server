import { CategoryType } from 'src/modules/category/category.enum';

export const calculateBalance = (
	currentBalance: number | string,
	amount: number | string,
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

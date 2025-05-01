import { ActionType } from 'src/modules/category/enums/action-type.enum';

export const calculateBalance = (
	currentBalance: number,
	amount: number,
	actionType: ActionType,
) => {
	switch (actionType) {
		case ActionType.INCOME:
			return Number(currentBalance) + Number(amount);
		case ActionType.EXPENSE:
			return Number(currentBalance) - Number(amount);
		default:
			return Number(currentBalance);
	}
};

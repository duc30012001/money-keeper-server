export interface PeriodResult {
	income: number;
	expenses: number;
	net: number;
}

export interface AnalyticResult {
	current: PeriodResult;
	previous: PeriodResult;
	change: {
		income: number | null;
		expenses: number | null;
		net: number | null;
	};
}

export interface ChartResult {
	label: string;
	income: number;
	expense: number;
}

export interface ExpenseByParentCategoryResult {
	label: string;
	value: number;
}

export interface IncomeByParentCategoryResult {
	label: string;
	value: number;
}

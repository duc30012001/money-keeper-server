import * as dayjs from 'dayjs';

export function getDateRange(transactionDate?: Date[]): Date[] {
	const [start, end] =
		transactionDate && transactionDate.length === 2
			? transactionDate
			: [
					dayjs().startOf('month').toDate(),
					dayjs().endOf('month').toDate(),
				];
	return [start, end];
}

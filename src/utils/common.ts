import { Locale } from 'src/common/enums/common';

export const getName = ({
	nameVi,
	nameEn,
	locale,
}: {
	nameVi: string;
	nameEn: string;
	locale: Locale;
}) => {
	if (locale === Locale.VI) return nameVi;
	if (locale === Locale.EN) return nameEn;
	return nameEn;
};

import { CategoryType } from '../modules/category/category.enum';

export const accountInitial = [
	{
		nameVi: 'Ví',
		nameEn: 'Wallet',
		accountType: {
			nameVi: 'Tiền mặt',
			nameEn: 'Cash',
		},
	},
];

export const accountTypeInitial = [
	{
		nameVi: 'Tiền mặt',
		nameEn: 'Cash',
		iconId: '40eb9644-2de9-4468-b5fa-886728359cb5',
	},
	{
		nameVi: 'Tài khoản ngân hàng',
		nameEn: 'Bank Account',
		iconId: '9bac0c6b-7091-4182-85cb-8dfc6b2f4f12',
	},
	{
		nameVi: 'Ví điện tử',
		nameEn: 'E-Wallet',
		iconId: '1fa7d384-2784-4342-bcd1-f516c6fb58fc',
	},
	{
		nameVi: 'Đầu tư',
		nameEn: 'Investment',
		iconId: '67bfed2b-b82d-4fee-9aca-9c76e121a565',
	},
	{
		nameVi: 'Thẻ tín dụng',
		nameEn: 'Credit Card',
		iconId: 'b9d6dbb1-de32-4492-b315-22bfeee17268',
	},
	{
		nameVi: 'Khác',
		nameEn: 'Other',
		iconId: 'b07c4b0a-5e40-4a22-a684-b554bd4ce9dd',
	},
];

export const categoryInitial = [
	// ─── KHOẢN THU (INCOME) ───
	{
		nameVi: 'Lương',
		nameEn: 'Salary',
		iconId: '00e3362f-f0aa-4fed-b421-dd3fa7b816de',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Kinh doanh & Đầu tư',
		nameEn: 'Business & Investment',
		iconId: '62af2a9d-8a75-4d08-a12e-0f39ade588df',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Thưởng & Quà tặng',
		nameEn: 'Bonus & Gifts',
		iconId: '8e994f59-7aa1-441f-9396-d8e5ff901ba8',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Thu nhập khác',
		nameEn: 'Others',
		iconId: 'ca1aa9e7-4cd0-4ed2-becc-7f99c8f818cc',
		type: CategoryType.INCOME,
	},

	// ─── KHOẢN CHI (EXPENSE) ───
	{
		nameVi: 'Ăn uống',
		nameEn: 'Food & Drink',
		iconId: '892f2892-8f87-4b78-b870-3c73beab4cec',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Ăn tiệm',
				nameEn: 'Dining out',
				iconId: '2f46dede-c782-4c8a-8a3d-7a55120b333b',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Đi chợ & Siêu thị',
				nameEn: 'Groceries',
				iconId: '60f5a178-bcc5-4826-b986-ec5cc86890b2',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Cà phê & Đồ uống',
				nameEn: 'Coffee & Drinks',
				iconId: 'e8e1f66a-0d3d-4efa-bdf5-72ab22047498',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Di chuyển',
		nameEn: 'Transportation',
		iconId: '968c494e-3c4e-404c-bc35-19e335b5544b',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Xăng xe',
				nameEn: 'Fuel',
				iconId: 'e3613c0d-51f2-4153-b36a-c34cd4f98238',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Taxi / Grab',
				nameEn: 'Taxi',
				iconId: '7e2eb288-0f0c-4502-bd37-9e52514c32e0',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Bảo dưỡng xe',
				nameEn: 'Maintenance',
				iconId: '55953f8e-4259-4f90-86fe-4220dfb0a41a',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Nhà cửa & Tiện ích',
		nameEn: 'Housing & Bills',
		iconId: 'ec44aeb4-d376-4315-b8d8-01d81a2395a1',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Tiền thuê nhà',
				nameEn: 'Rent',
				iconId: 'a729447d-c9ce-4ab4-b0c5-534cd8a60f9b',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Điện & Nước',
				nameEn: 'Electricity & Water',
				iconId: '17c2f675-d58b-49d3-9338-45606adc8687',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Internet & Điện thoại',
				nameEn: 'Internet & Phone',
				iconId: 'd7af79e7-b62c-431d-af25-9c2e3add73a8',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Mua sắm',
		nameEn: 'Shopping',
		iconId: '42e0e900-de08-4a87-9fc8-e26e65336b27',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Quần áo',
				nameEn: 'Clothes',
				iconId: '72d216ef-3890-4d64-98be-e35ba30cd6ce',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Đồ gia dụng',
				nameEn: 'Household',
				iconId: '42e0e900-de08-4a87-9fc8-e26e65336b27',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Sức khỏe & Thể thao',
		nameEn: 'Health & Sports',
		iconId: '46671fa2-6787-4a10-887e-920abb7ee08e',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Thuốc men & Khám bệnh',
				nameEn: 'Medicine & Clinic',
				iconId: '57273576-8d03-4613-b566-5c8877ac6071',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Gym & Thể thao',
				nameEn: 'Fitness',
				iconId: '7ba61930-4c1b-458b-99a9-361820686ca1',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Học tập',
		nameEn: 'Education',
		iconId: 'e60ea244-b084-4889-b646-f60f1ac1e79b',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Học phí & Khóa học',
				nameEn: 'Tuition & Courses',
				iconId: '9d9882fb-cdb9-4c34-9ac7-023eeec4743f',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Sách vở & Đồ dùng',
				nameEn: 'Books & Stationery',
				iconId: 'ba09e3f7-3a3b-4ba4-8175-f3f087110569',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Giải trí & Bạn bè',
		nameEn: 'Entertainment & Social',
		iconId: '063503e2-1805-4baf-be2e-b83ff350489b',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Xem phim & Đi chơi',
				nameEn: 'Movies & Social',
				iconId: '4983aa50-ce04-451c-bbad-e020d2de7483',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Du lịch',
				nameEn: 'Travel',
				iconId: 'f467af78-c6af-4332-ae85-dbd5b32a4f39',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Khác',
		nameEn: 'Others',
		iconId: 'a029d42e-77d9-4bb8-afac-2ca9301b28f8',
		type: CategoryType.EXPENSE,
	},
];


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
	{
		nameVi: 'Tiền boa',
		nameEn: 'Tips',
		iconId: '4d8e4abc-093b-40b9-9178-48bcdb0bab06',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Lương',
		nameEn: 'Salary',
		iconId: '0db204e4-b203-403b-911f-68dedd0749bd',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Thưởng',
		nameEn: 'Bonus',
		iconId: '4d8e4abc-093b-40b9-9178-48bcdb0bab06',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Kinh doanh',
		nameEn: 'Business',
		iconId: '3c7f3703-39b0-4aab-9091-2be23dcab725',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Lãi tiết kiệm',
		nameEn: 'Interest',
		iconId: '9a42371b-4a90-46ef-b79f-c54a76e21a66',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Đầu tư',
		nameEn: 'Investment',
		iconId: '3c7f3703-39b0-4aab-9091-2be23dcab725',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Quà tặng',
		nameEn: 'Gift',
		iconId: '1a6dcd34-330d-4bd8-9e70-5656dd47fe51',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Hoàn tiền',
		nameEn: 'Refund',
		iconId: '95f81861-4762-4c7e-ad07-6766ee31fc39',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Đi vay',
		nameEn: 'Borrow',
		iconId: '46163cf6-e5a7-4d09-875b-8ef1c4f220f5',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Thu nợ',
		nameEn: 'Collecting debts',
		iconId: '6605a9e2-490a-4765-9c14-f4a4f5e8655b',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Khác',
		nameEn: 'Others',
		iconId: '4f23f176-61b2-41c5-b99b-027af5c521b4',
		type: CategoryType.INCOME,
	},
	{
		nameVi: 'Ăn uống',
		nameEn: 'Food & Drink',
		iconId: 'ff1438e6-9a62-4355-813b-85487a8370be',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Ăn sáng',
				nameEn: 'Breakfast',
				iconId: '8602f971-f0df-4d67-9833-5dd619c090ec',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Ăn trưa',
				nameEn: 'Lunch',
				iconId: 'cb06c53e-205e-45d5-9f2a-a31ca56b31f9',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Ăn tối',
				nameEn: 'Dinner',
				iconId: '0b6fa1e4-caac-4608-8c8f-7a441fac558c',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Đi chợ, siêu thị',
				nameEn: 'Groceries',
				iconId: '53f45534-161a-4244-82fa-850895f17672',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Cà phê',
				nameEn: 'Coffee',
				iconId: '1a7bccc3-24e8-4eef-ba17-8cde244de688',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Ăn ngoài',
				nameEn: 'Dining out',
				iconId: '1147402f-6afa-4e37-9b82-071057a4cdcc',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Di chuyển',
		nameEn: 'Transportation',
		iconId: 'd2587bc3-b7ec-40a3-adec-6cf4b6385e93',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Xăng',
				nameEn: 'Fuel',
				iconId: '71e4d6b3-1343-44f6-ab9b-6e83d0d93965',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Gửi xe',
				nameEn: 'Parking',
				iconId: 'ad08f937-9ebd-4cc7-869c-b5e1b9e036e7',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Taxi / Grab',
				nameEn: 'Taxi',
				iconId: '102fe6fb-1d08-4bcf-a4a7-8c371c7dee72',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Xe buýt, tàu',
				nameEn: 'Public transport',
				iconId: '511f8d8c-d414-4bf2-b8fb-cdb8c9773d38',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Bảo dưỡng xe',
				nameEn: 'Vehicle maintenance',
				iconId: '96e5c188-8067-46f6-9352-76717d3615a8',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Nhà ở',
		nameEn: 'Housing',
		iconId: '386e534f-8fad-4d57-acf8-0943c9998715',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Tiền thuê nhà',
				nameEn: 'Rent',
				iconId: '4ec036dd-895a-486a-a1b3-fd0aa957c33b',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Tiền điện',
				nameEn: 'Electricity',
				iconId: 'd5b783a5-8847-4cc7-90f0-c325f61620f6',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Tiền nước',
				nameEn: 'Water',
				iconId: '2071ef06-62d2-4c6e-b9a0-73b71bd0a0e6',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Mạng internet',
				nameEn: 'Internet',
				iconId: '64fc2f6e-352d-4665-a6e9-6ddafe0475db',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Sửa chữa',
				nameEn: 'Repairs',
				iconId: '0cabd66b-0253-426a-aefb-04621e9e38b2',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Hóa đơn & tiện ích',
		nameEn: 'Bills & Utilities',
		iconId: 'e35ad8ef-4deb-44cc-bb2c-121d108e0549',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Hóa đơn điện thoại',
				nameEn: 'Phone bill',
				iconId: '369e8511-02c3-4632-9ed3-9959b2d3a8e5',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Hóa đơn mạng',
				nameEn: 'Internet bill',
				iconId: '64fc2f6e-352d-4665-a6e9-6ddafe0475db',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Truyền hình',
				nameEn: 'TV',
				iconId: '40118744-9561-4d3a-a551-5bd29be788cf',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Dịch vụ định kỳ (Netflix, Spotify…)',
				nameEn: 'Subscription (Netflix, Spotify…)',
				iconId: '369e8511-02c3-4632-9ed3-9959b2d3a8e5',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Mua sắm',
		nameEn: 'Shopping',
		iconId: '67a136e4-1ab4-4dfd-a3e5-aa9691b15d6f',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Quần áo',
				nameEn: 'Clothes',
				iconId: '7f2d359c-893c-4363-a6f9-402de7712758',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Giày dép',
				nameEn: 'Shoes',
				iconId: '4ed2aac2-97c7-4636-971a-f34aa02a1f25',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Đồ điện tử',
				nameEn: 'Electronics',
				iconId: '970a874a-35b3-4a8c-9f88-eb13a26b894d',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Đồ gia dụng',
				nameEn: 'Household items',
				iconId: 'fc6a7b6e-d38f-4c55-b732-0e0bf88f7c33',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Sức khỏe',
		nameEn: 'Health',
		iconId: '2b26f960-7742-434d-8f79-2d3d89450b15',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Thuốc men',
				nameEn: 'Medicine',
				iconId: '1de0567e-80df-4db0-b03e-0ecca13f7687',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Khám bệnh',
				nameEn: 'Clinic',
				iconId: 'd3c8d626-f4bd-4c65-b0b8-4d3fa9c4c9ef',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Bảo hiểm sức khỏe',
				nameEn: 'Insurance',
				iconId: '523cc6c4-f86f-4e79-bbf0-89de76da89c4',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Phòng gym, thể thao',
				nameEn: 'Fitness',
				iconId: 'b398dfcd-1bef-4352-ac15-604917cf1320',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Học tập',
		nameEn: 'Education',
		iconId: 'af2225d3-92da-4d44-99a7-61a26158370a',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Học phí',
				nameEn: 'Tuition',
				iconId: '8c7da71e-30ac-4d7d-ae09-bbfc06b8ca13',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Sách vở',
				nameEn: 'Books',
				iconId: '49b160f6-6e32-4029-8597-59245541fcd1',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Khóa học',
				nameEn: 'Courses',
				iconId: '5947ab74-10f6-4f44-8446-565be01a550a',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Văn phòng phẩm',
				nameEn: 'Stationery',
				iconId: 'ac843ba1-d074-4e1b-afa4-c18a993225c4',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Giải trí',
		nameEn: 'Entertainment',
		iconId: '9bd942e1-f6fc-44bd-b1fc-88d647a83c02',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Xem phim',
				nameEn: 'Movies',
				iconId: '3139ceea-eb59-46d1-8c2e-8e30e2bc929b',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Trò chơi',
				nameEn: 'Games',
				iconId: '5ac23d5b-faa7-4c5a-8d26-af908b785dbf',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Du lịch',
				nameEn: 'Travel',
				iconId: 'dbd2c7c6-2192-4f63-b3ec-1799ce964be7',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Karaoke',
				nameEn: 'Karaoke',
				iconId: '045c9eb2-e956-4e54-9ca9-608ed6b2455a',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Gia đình',
		nameEn: 'Family',
		iconId: '9be8bc54-437b-45f8-ae77-8d9b67776cf6',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Nuôi con',
				nameEn: 'Childcare',
				iconId: 'a76b3a6b-d005-427c-934a-bad5b090a92f',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Hỗ trợ cha mẹ',
				nameEn: 'Parents',
				iconId: 'c3fe6bbb-8a0c-427f-9efc-8259ea704569',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Thú cưng',
				nameEn: 'Pets',
				iconId: '3a75a9b1-f866-44cd-80c0-4f479b173870',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Quà tặng',
				nameEn: 'Gifts',
				iconId: 'c3fe6bbb-8a0c-427f-9efc-8259ea704569',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Nợ & vay',
		nameEn: 'Debt & Loan',
		iconId: '14845de7-cfe6-409f-a809-399ca2c57bc3',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Trả nợ',
				nameEn: 'Loan repayment',
				iconId: '357f1f40-850c-4ef3-b588-a591b6e3dfae',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Trả lãi',
				nameEn: 'Interest payment',
				iconId: '67bfed2b-b82d-4fee-9aca-9c76e121a565',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Cho vay',
				nameEn: 'Lending',
				iconId: '80403275-4303-4068-b264-6e58594098e8',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Quà tặng & Quyên góp',
		nameEn: 'Gifts & Donations',
		iconId: 'b3b71024-9447-4101-9219-3e8b9604fde2',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Từ thiện',
				nameEn: 'Charity',
				iconId: '925a3eb1-d199-43a6-b073-e3e26a5a9ae1',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Cúng dường, làm lễ',
				nameEn: 'Religious offering',
				iconId: 'aafe3147-ad67-489a-b557-afb26640813c',
				type: CategoryType.EXPENSE,
			},
		],
	},
	{
		nameVi: 'Khác',
		nameEn: 'Others',
		iconId: 'ffc1e9f4-b72f-4a56-98bf-dede708a5a75',
		type: CategoryType.EXPENSE,
		children: [
			{
				nameVi: 'Chi phí phát sinh',
				nameEn: 'Unexpected expenses',
				iconId: 'ffc1e9f4-b72f-4a56-98bf-dede708a5a75',
				type: CategoryType.EXPENSE,
			},
			{
				nameVi: 'Mất tiền',
				nameEn: 'Lost money',
				iconId: 'ffc1e9f4-b72f-4a56-98bf-dede708a5a75',
				type: CategoryType.EXPENSE,
			},
		],
	},
];

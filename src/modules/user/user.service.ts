import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { Locale } from 'src/common/enums/common';
import { AuthMessages } from 'src/common/messages';
import { FindOptionsWhere, ILike, Not, Repository } from 'typeorm';
import { AccountTypeService } from '../account-type/account-type.service';
import { AccountService } from '../account/services/account.service';
import { CategoryService } from '../category/services/category.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUserDto } from './dtos/get-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		private readonly accountTypeService: AccountTypeService,
		private readonly categoryService: CategoryService,
		private readonly accountService: AccountService,
	) {}

	async create({ locale, ...dto }: CreateUserDto): Promise<User> {
		// 1) Check duplicate email
		const exists = await this.userRepo.findOne({
			where: { email: dto.email },
		});
		if (exists) {
			throw new ConflictException(AuthMessages.EMAIL_IN_USE);
		}

		// 2) Hash and save
		const user = this.userRepo.create({
			...dto,
			password: await hash(dto.password),
		});
		const savedUser = await this.userRepo.save(user);

		await this.categoryService.init(user.id, locale ?? Locale.EN);
		await this.accountTypeService.init(user.id, locale ?? Locale.EN);
		await this.accountService.init(user.id, locale ?? Locale.EN);

		return savedUser;
	}

	async update(id: string, dto: UpdateUserDto): Promise<User> {
		// 1. Preload will merge dto into a new entity **only if** it finds one with that id
		const toSave = await this.userRepo.preload({ id, ...dto });
		if (!toSave) {
			// now TS knows toSave is defined after this point
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}

		if (dto.email) {
			// 2. Duplicate‑email check (if you still need it)
			const conflict = await this.userRepo.findOne({
				where: { email: dto.email, id: Not(id) },
			});
			if (conflict) {
				throw new ConflictException(AuthMessages.EMAIL_IN_USE);
			}
		}

		// 3. Hash new password
		if (dto.password) {
			toSave.password = await hash(dto.password);
		}

		// 4. Save
		return this.userRepo.save(toSave);
	}

	/**
	 * Fetch a single user by ID.
	 * Omits password (select: false) automatically.
	 */
	async getOneById(id: string): Promise<User> {
		const user = await this.userRepo.findOne({
			where: { id },
		});
		if (!user) {
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}
		return user;
	}

	/**
	 * Fetch a single user by ID.
	 * Omits password (select: false) automatically.
	 */
	async getOneByEmail(email: string): Promise<User> {
		const user = await this.userRepo.findOne({
			where: { email },
			select: {
				id: true,
				password: true,
				email: true,
				isActive: true,
				role: true,
				createdAt: false,
				updatedAt: false,
			},
		});
		if (!user) {
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}
		return user;
	}

	/**
	 * Fetch a paginated list of users, with optional keyword and isActive filters.
	 */
	async getList(query: ListUserDto): Promise<PaginatedResponseDto<User>> {
		const { keyword, isActive, skip, limit, page, pageSize } = query;

		// Build dynamic where clause
		const where: FindOptionsWhere<User> = {};
		if (keyword) {
			where.email = ILike(`%${keyword}%`);
		}
		if (typeof isActive === 'boolean') {
			where.isActive = isActive;
		}

		const [items, total] = await this.userRepo.findAndCount({
			where,
			skip,
			take: limit,
			order: { createdAt: 'DESC' },
		});

		const meta = new PaginationMeta({
			total,
			page,
			pageSize,
		});

		return new PaginatedResponseDto(items, meta);
	}
}

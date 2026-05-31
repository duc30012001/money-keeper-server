import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { FirebaseUser } from '../firebase/firebase-auth.service';
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

	/** Create a user directly (used by admin and init module) */
	async create(dto: CreateUserDto): Promise<User> {
		// Check duplicate email
		const exists = await this.userRepo.findOne({
			where: { email: dto.email },
		});
		if (exists) {
			throw new ConflictException(AuthMessages.EMAIL_IN_USE);
		}

		const { locale, ...userData } = dto;
		const user = this.userRepo.create(userData);
		const savedUser = await this.userRepo.save(user);

		await this.categoryService.init(savedUser.id, locale ?? Locale.EN);
		await this.accountTypeService.init(savedUser.id, locale ?? Locale.EN);
		await this.accountService.init(savedUser.id, locale ?? Locale.EN);

		return savedUser;
	}

	/** Find existing user by Firebase UID or email, or create a new one */
	async findOrCreateByFirebase(
		firebaseUser: FirebaseUser,
		locale?: Locale,
	): Promise<User> {
		// 1) Try to find by firebaseUid
		let user = await this.userRepo.findOne({
			where: { firebaseUid: firebaseUser.uid },
		});
		if (user) {
			// Update display name and photo if changed
			let needsUpdate = false;
			if (
				firebaseUser.displayName &&
				user.displayName !== firebaseUser.displayName
			) {
				user.displayName = firebaseUser.displayName;
				needsUpdate = true;
			}
			if (
				firebaseUser.photoURL &&
				user.photoUrl !== firebaseUser.photoURL
			) {
				user.photoUrl = firebaseUser.photoURL;
				needsUpdate = true;
			}
			if (needsUpdate) {
				user = await this.userRepo.save(user);
			}
			return user;
		}

		// 2) Try to find by email (migration: link existing user)
		user = await this.userRepo.findOne({
			where: { email: firebaseUser.email },
		});
		if (user) {
			user.firebaseUid = firebaseUser.uid;
			if (firebaseUser.displayName) {
				user.displayName = firebaseUser.displayName;
			}
			if (firebaseUser.photoURL) {
				user.photoUrl = firebaseUser.photoURL;
			}
			return this.userRepo.save(user);
		}

		// 3) Create new user
		const newUser = this.userRepo.create({
			email: firebaseUser.email,
			firebaseUid: firebaseUser.uid,
			displayName: firebaseUser.displayName ?? null,
			photoUrl: firebaseUser.photoURL ?? null,
		});
		const savedUser = await this.userRepo.save(newUser);

		// Initialize default data
		await this.categoryService.init(savedUser.id, locale ?? Locale.EN);
		await this.accountTypeService.init(savedUser.id, locale ?? Locale.EN);
		await this.accountService.init(savedUser.id, locale ?? Locale.EN);

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

		// 3. Save
		return this.userRepo.save(toSave);
	}

	/**
	 * Fetch a single user by ID.
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
	 * Fetch a single user by email.
	 */
	async getOneByEmail(email: string): Promise<User> {
		const user = await this.userRepo.findOne({
			where: { email },
		});
		if (!user) {
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}
		return user;
	}

	/** Fetch a single user by Firebase UID */
	async getOneByFirebaseUid(firebaseUid: string): Promise<User> {
		const user = await this.userRepo.findOne({
			where: { firebaseUid },
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

// src/modules/user/user.service.ts
import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { FindOptionsWhere, ILike, Not, Repository } from 'typeorm';

import {
	PaginatedResponseDto,
	PaginationMeta,
} from 'src/common/dtos/response.dto';
import { AuthMessages } from 'src/common/messages';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUserDto } from './dtos/get-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	async create(dto: CreateUserDto): Promise<User> {
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
		return this.userRepo.save(user);
	}

	async update(id: string, dto: UpdateUserDto): Promise<User> {
		// 1. Preload will merge dto into a new entity **only if** it finds one with that id
		const toSave = await this.userRepo.preload({ id, ...dto });
		if (!toSave) {
			// now TS knows toSave is defined after this point
			throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
		}

		// 2. Duplicate‑email check (if you still need it)
		const conflict = await this.userRepo.findOne({
			where: { email: dto.email, id: Not(id) },
		});
		if (conflict) {
			throw new ConflictException(AuthMessages.EMAIL_IN_USE);
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
		const user = await this.userRepo.findOne({ where: { id } });
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
		const user = await this.userRepo.findOne({ where: { email } });
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

		const meta: PaginationMeta = {
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};

		return new PaginatedResponseDto(items, meta);
	}
}

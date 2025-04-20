// src/common/dtos/response.dto.ts

/**
 * Standard wrapper for single-item responses.
 */
export class ResponseDto<T> {
	/** The actual response payload. */
	data: T;

	constructor(data: T) {
		this.data = data;
	}
}

/**
 * Metadata for paginated responses.
 */
export interface PaginationMeta {
	/** Total number of items across all pages. */
	total: number;
	/** Current page number (1-based). */
	page: number;
	/** Items per page. */
	pageSize: number;
	/** Total number of pages. */
	totalPages: number;
}

/**
 * Standard wrapper for paginated list responses.
 */
export class PaginatedResponseDto<T> {
	/** The list of items for the current page. */
	data: T[];

	/** Pagination metadata. */
	meta: PaginationMeta;

	constructor(data: T[], meta: PaginationMeta) {
		this.data = data;
		this.meta = meta;
	}
}

// src/common/interceptors/response.interceptor.ts
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dtos/response.dto';

/**
 * Wraps anything returned from controllers into { data: ... }.
 * If the controller already returned an object with { data, meta }, it passes through.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
	intercept(
		context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<any> {
		return next.handle().pipe(
			map((result) => {
				// if result already has data/meta, assume PaginatedResponseDto
				if (result && typeof result === 'object' && 'data' in result) {
					return result;
				}
				// otherwise wrap plain data
				return new ResponseDto(result);
			}),
		);
	}
}

// src/jwt/jwt.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { decode, JwtHeader, VerifyOptions } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { AuthMessages } from 'src/common/messages';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';

@Injectable()
export class JwtService {
	private jwksClient: JwksClient;
	private algorithm: jwt.Algorithm;

	constructor(
		private readonly jwtService: NestJwtService,
		private readonly config: ConfigService,
	) {
		this.jwksClient = new JwksClient({
			jwksUri: this.config.get<string>('jwt.jwksUri') as string,
			cache: true,
			rateLimit: true,
			jwksRequestsPerMinute: 10,
		});
		this.algorithm = this.config.get<string>(
			'jwt.algorithm',
		) as jwt.Algorithm;
	}

	/** Generate an access token with your RSA private key */
	async generateAccessToken(payload: Record<string, any>): Promise<string> {
		return this.jwtService.signAsync(payload, {
			privateKey: this.config.get<string>('jwt.privateKey'),
			algorithm: this.config.get<string>(
				'jwt.algorithm',
			) as jwt.Algorithm,
			expiresIn: this.config.get<string>('jwt.accessTokenExpiresIn'),
		});
	}

	/** Generate a refresh token with your RSA private key */
	async generateRefreshToken(payload: Record<string, any>): Promise<string> {
		return this.jwtService.signAsync(payload, {
			privateKey: this.config.get<string>('jwt.privateKey'),
			algorithm: this.algorithm,
			expiresIn: this.config.get<string>('jwt.refreshTokenExpiresIn'),
		});
	}

	/**
	 * Fetch the RSA public key (PEM string) for a given kid.
	 * Throws if not found.
	 */
	private async getPublicKeyForKid(kid: string): Promise<string> {
		const signingKey = await this.jwksClient.getSigningKey(kid);
		if (!signingKey) {
			throw new UnauthorizedException(
				`Unable to find signing key for kid ${kid}`,
			);
		}
		return signingKey.getPublicKey();
	}

	/**
	 * Verify a token asynchronously against your JWKS.
	 * Throws UnauthorizedException if anything goes wrong.
	 */
	async verifyTokenAsync<T extends object = JwtPayload>(
		token: string,
	): Promise<T> {
		// decode header
		const decoded = decode(token, { complete: true }) as {
			header?: JwtHeader;
		};
		const kid = decoded?.header?.kid;

		const verifyOpts: VerifyOptions = {
			algorithms: [this.algorithm],
		};
		try {
			if (kid) {
				// JWKS path
				const publicKey = await this.getPublicKeyForKid(kid);
				return this.jwtService.verifyAsync<T>(token, {
					publicKey,
					...verifyOpts,
				});
			} else {
				// fallback to static publicKey from config
				const publicKey = this.config.get<string>('jwt.publicKey');
				return this.jwtService.verifyAsync<T>(token, {
					publicKey,
					...verifyOpts,
				});
			}
		} catch (err) {
			throw new UnauthorizedException(
				err || AuthMessages.INVALID_OR_EXPIRED_TOKEN,
			);
		}
	}
}

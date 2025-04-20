import { readFileSync } from 'fs';
import { join } from 'path';

export default () => ({
	jwt: {
		// Using RS256, load the private and public keys
		algorithm: 'RS256',
		privateKey: readFileSync(
			join(__dirname, '../../keys/private.pem'),
			'utf8',
		),
		publicKey: readFileSync(
			join(__dirname, '../../keys/public.pem'),
			'utf8',
		),
		// Token expiration settings read from environment variables or defaults
		accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
		refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
		// JWKS endpoint for key rotation and verification (if needed)
		jwksUri:
			process.env.JWKS_URI ||
			'http://localhost:3131/.well-known/jwks.json',
		kid: process.env.JWT_KID || '01965251-3cf7-772b-a14b-bea3e7fb4ccd',
	},
});

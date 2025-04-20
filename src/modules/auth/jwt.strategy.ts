// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import * as jwksRsa from 'jwks-rsa';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { JwtPayload } from './interfaces/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
// 	constructor() {
// 		super({
// 			// Extract JWT from Bearer token in the Authorization header
// 			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 			// Instead of a fixed secret, use the JWKS endpoint to get your keys
// 			secretOrKeyProvider: jwksRsa.passportJwtSecret({
// 				cache: true,
// 				rateLimit: true,
// 				jwksRequestsPerMinute: 5,
// 				// Replace with your actual JWKS endpoint (e.g., from Auth0, Okta, etc.)
// 				jwksUri: 'https://example.com/.well-known/jwks.json',
// 			}),
// 			// Use an asymmetric algorithm such as RS256
// 			algorithms: ['RS256'],
// 		});
// 	}

// 	// The validate method is called after token is verified
// 	validate(payload: JwtPayload) {
// 		// Here you can add custom validation logic or return the payload as user information
// 		return payload;
// 	}
// }

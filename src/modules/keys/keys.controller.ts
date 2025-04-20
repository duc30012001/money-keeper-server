import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pem2jwk } from 'pem-jwk';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtConfig } from 'src/common/types/config.interface';

@Public()
@Controller()
export class KeysController {
	constructor(private config: ConfigService) {}

	@Get('.well-known/jwks.json')
	getJwks() {
		const publicKey = this.config.get<string>(
			'jwt.publicKey',
		) as JwtConfig['publicKey'];
		const kid = this.config.get<string>('jwt.kid') as JwtConfig['kid'];
		const jwk = pem2jwk(publicKey, { use: 'sig', alg: 'RS256', kid });
		return { keys: [jwk] };
	}
}

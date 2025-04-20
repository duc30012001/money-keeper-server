import { JwtPayload } from 'src/common/types/jwt-payload.interface';

declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload; // now req.user is typed
		}
	}
}

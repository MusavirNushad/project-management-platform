import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { TOKEN_SERVICE } from '../../application/ports/token-service.port';
import type {
    AuthTokenPayload,
    TokenServicePort,
} from '../../application/ports/token-service.port';

type AuthenticatedRequest = Request & {
    user?: AuthTokenPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const token = this.extractBearerToken(request);

        if (!token) {
            throw new UnauthorizedException('Unauthorized.');
        }

        try {
            const payload = await this.tokenService.verifyAccessToken(token);

            request.user = payload;

            return true;
        } catch {
            throw new UnauthorizedException('Unauthorized.');
        }
    }

    private extractBearerToken(request: Request): string | null {
        const authorizationHeader = request.headers.authorization;

        if (!authorizationHeader) {
            return null;
        }

        const [scheme, token] = authorizationHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return null;
        }

        return token;
    }
}
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import {
    TOKEN_SERVICE,
    type TokenServicePort,
} from '../../../../modules/identity/application/ports/token-service.port';

import type {
    AuthenticatedSocket,
    AuthenticatedSocketUser,
} from '../types/authenticated-socket.type';

@Injectable()
export class SocketAuthenticationService {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
    ) { }

    async authenticate(
        client: AuthenticatedSocket,
    ): Promise<AuthenticatedSocketUser> {
        const token = this.extractToken(client);

        const payload = await this.tokenService.verifyAccessToken(token);

        const user: AuthenticatedSocketUser = {
            userId: payload.userId,
            email: payload.email,
        };

        client.data.user = user;

        return user;
    }

    private extractToken(client: AuthenticatedSocket): string {
        const authToken = client.handshake.auth?.token;

        if (typeof authToken === 'string' && authToken.length > 0) {
            return authToken;
        }

        const authorizationHeader = client.handshake.headers.authorization;

        if (
            typeof authorizationHeader === 'string' &&
            authorizationHeader.startsWith('Bearer ')
        ) {
            return authorizationHeader.slice(7);
        }

        throw new UnauthorizedException('Missing socket auth token');
    }
}
import { WsException } from '@nestjs/websockets';

import type {
    AuthenticatedSocket,
    AuthenticatedSocketUser,
} from '../types/authenticated-socket.type';

export function ensureAuthenticatedSocket(
    client: AuthenticatedSocket,
): AuthenticatedSocketUser {
    if (!client.data.user) {
        throw new WsException('Unauthenticated socket');
    }

    return client.data.user;
}
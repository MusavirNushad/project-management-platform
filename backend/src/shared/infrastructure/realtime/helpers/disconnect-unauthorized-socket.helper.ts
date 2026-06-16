import type { LoggerService } from '@nestjs/common';

import type { AuthenticatedSocket } from '../types/authenticated-socket.type';

export function disconnectUnauthorizedSocket(params: {
    client: AuthenticatedSocket;
    logger: LoggerService;
    context: string;
    error: unknown;
}): void {
    const { client, logger, context, error } = params;

    const message = error instanceof Error ? error.message : String(error);

    logger.warn(
        `Unauthorized ${context} socket connection: ${client.id}. Reason: ${message}`,
    );

    client.emit('realtime:error', {
        message: 'Unauthorized socket connection',
        reason: message,
    });

    client.disconnect(true);
}
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import type { AuthenticatedSocket } from '../../../../shared/infrastructure/realtime/types/authenticated-socket.type';

@Injectable()
export class TaskRealtimeAuthenticatedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();

        const userId = client.data.user?.userId;

        if (!userId) {
            throw new WsException('You are not authenticated.');
        }

        return true;
    }
}
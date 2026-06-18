import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { AccessControlService } from '../../../access-control/application/services/access-control.service';

import type { AuthenticatedSocket } from '../../../../shared/infrastructure/realtime/types/authenticated-socket.type';

type JoinWorkspaceRoomPayload = {
    workspaceId?: unknown;
};

@Injectable()
export class WorkspaceRealtimeAccessGuard implements CanActivate {
    private readonly logger = new Logger(WorkspaceRealtimeAccessGuard.name);

    constructor(private readonly accessControlService: AccessControlService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();
        const payload = context.switchToWs().getData<JoinWorkspaceRoomPayload>();

        const userId = client.data.user?.userId;
        const workspaceId = payload.workspaceId;

        if (!userId || typeof workspaceId !== 'string') {
            throw new WsException(
                'You are not allowed to join this workspace room.',
            );
        }

        try {
            const canAccessWorkspace =
                await this.accessControlService.canAccessWorkspace({
                    workspaceId,
                    userId,
                });

            if (!canAccessWorkspace) {
                throw new WsException(
                    'You are not allowed to join this workspace room.',
                );
            }

            return true;
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }

            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Workspace realtime access check failed. workspaceId=${workspaceId}, userId=${userId}, reason=${message}`,
            );

            throw new WsException(
                'You are not allowed to join this workspace room.',
            );
        }
    }
}

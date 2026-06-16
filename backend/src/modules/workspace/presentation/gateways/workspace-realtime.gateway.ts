import { Logger, UsePipes } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WsException,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';

import { disconnectUnauthorizedSocket } from '../../../../shared/infrastructure/realtime/helpers/disconnect-unauthorized-socket.helper';
import { ensureAuthenticatedSocket } from '../../../../shared/infrastructure/realtime/helpers/ensure-authenticated-socket.helper';
import { SocketAuthenticationService } from '../../../../shared/infrastructure/realtime/services/socket-authentication.service';
import type { AuthenticatedSocket } from '../../../../shared/infrastructure/realtime/types/authenticated-socket.type';
import {
    realtimeGatewayOptions,
    realtimeValidationPipe,
} from '../../../../shared/infrastructure/realtime/config/realtime-gateway.config';

import { WorkspaceRealtimeAccessService } from '../../application/services/workspace-realtime/workspace-realtime-access.service';
import { WorkspaceRealtimeEventsService } from '../../application/services/workspace-realtime/workspace-realtime-events.service';
import { WorkspaceRealtimeEvent } from '../../application/types/workspace-realtime-event.types';
import { WorkspaceRealtimeRoom } from '../../application/types/workspace-realtime-room.types';
import { JoinWorkspaceRoomDto } from '../dtos/requests/join-workspace-room.dto';

@UsePipes(realtimeValidationPipe)
@WebSocketGateway(realtimeGatewayOptions)
export class WorkspaceRealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(WorkspaceRealtimeGateway.name);

    constructor(
        private readonly socketAuthenticationService: SocketAuthenticationService,
        private readonly workspaceRealtimeEventsService: WorkspaceRealtimeEventsService,
        private readonly workspaceRealtimeAccessService: WorkspaceRealtimeAccessService,
    ) { }

    afterInit(server: Server): void {
        this.workspaceRealtimeEventsService.setServer(server);
        this.logger.log('Workspace realtime gateway initialized');
    }

    async handleConnection(client: AuthenticatedSocket): Promise<void> {
        try {
            const user = await this.socketAuthenticationService.authenticate(client);

            await client.join(WorkspaceRealtimeRoom.user(user.userId));

            client.emit(WorkspaceRealtimeEvent.Connected, {
                message: 'Connected to workspace realtime server',
                userId: user.userId,
            });

            this.logger.log(
                `Workspace socket connected: ${client.id}, user: ${user.userId}`,
            );
        } catch (error) {
            disconnectUnauthorizedSocket({
                client,
                logger: this.logger,
                context: 'workspace',
                error,
            });
        }
    }

    handleDisconnect(client: AuthenticatedSocket): void {
        const userId = client.data.user?.userId;

        this.logger.log(
            `Workspace socket disconnected: ${client.id}${userId ? `, user: ${userId}` : ''
            }`,
        );
    }

    @SubscribeMessage('join:workspace')
    async handleJoinWorkspace(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinWorkspaceRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        const user = ensureAuthenticatedSocket(client);

        const canJoin =
            await this.workspaceRealtimeAccessService.canJoinWorkspace({
                userId: user.userId,
                workspaceId: body.workspaceId,
            });

        if (!canJoin) {
            throw new WsException('You are not allowed to join this workspace room.');
        }

        const room = WorkspaceRealtimeRoom.workspace(body.workspaceId);

        await client.join(room);

        client.emit(WorkspaceRealtimeEvent.WorkspaceJoined, {
            workspaceId: body.workspaceId,
        });

        return {
            success: true,
            room,
        };
    }

    @SubscribeMessage('leave:workspace')
    async handleLeaveWorkspace(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinWorkspaceRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        ensureAuthenticatedSocket(client);

        const room = WorkspaceRealtimeRoom.workspace(body.workspaceId);

        await client.leave(room);

        client.emit(WorkspaceRealtimeEvent.WorkspaceLeft, {
            workspaceId: body.workspaceId,
        });

        return {
            success: true,
            room,
        };
    }
}
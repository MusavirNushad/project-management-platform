import {
    Inject,
    Logger,
    UnauthorizedException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
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

import {
    TOKEN_SERVICE,
    type TokenServicePort,
} from '../../../identity/application/ports/token-service.port';
import { WorkspaceRealtimeAccessService } from '../../application/services/workspace-realtime/workspace-realtime-access.service';
import { WorkspaceRealtimeEventsService } from '../../application/services/workspace-realtime/workspace-realtime-events.service';
import { WorkspaceRealtimeEvent } from '../../application/types/workspace-realtime-event.types';
import { WorkspaceRealtimeRoom } from '../../application/types/workspace-realtime-room.types';
import { JoinWorkspaceRoomDto } from '../dtos/requests/join-workspace-room.dto';
import type {
    AuthenticatedWorkspaceSocket,
    AuthenticatedWorkspaceSocketUser,
} from '../types/authenticated-workspace-socket.type';

@UsePipes(
    new ValidationPipe({
        whitelist: true,
        transform: true,
    }),
)
@WebSocketGateway({
    namespace: '/realtime',
    cors: {
        origin: '*',
    },
})
export class WorkspaceRealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(WorkspaceRealtimeGateway.name);

    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
        private readonly workspaceRealtimeEventsService: WorkspaceRealtimeEventsService,
        private readonly workspaceRealtimeAccessService: WorkspaceRealtimeAccessService,
    ) { }

    afterInit(server: Server): void {
        this.workspaceRealtimeEventsService.setServer(server);
        this.logger.log('Workspace realtime gateway initialized');
    }

    async handleConnection(
        client: AuthenticatedWorkspaceSocket,
    ): Promise<void> {
        try {
            const token = this.extractToken(client);

            const payload = await this.tokenService.verifyAccessToken(token);

            client.data.user = {
                userId: payload.userId,
                email: payload.email,
            };

            await client.join(WorkspaceRealtimeRoom.user(payload.userId));

            client.emit(WorkspaceRealtimeEvent.Connected, {
                message: 'Connected to workspace realtime server',
                userId: payload.userId,
            });

            this.logger.log(
                `Workspace socket connected: ${client.id}, user: ${payload.userId}`,
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Unauthorized workspace socket connection: ${client.id}. Reason: ${message}`,
            );

            client.emit('realtime:error', {
                message: 'Unauthorized socket connection',
                reason: message,
            });

            client.disconnect(true);
        }
    }

    handleDisconnect(client: AuthenticatedWorkspaceSocket): void {
        const userId = client.data.user?.userId;

        this.logger.log(
            `Workspace socket disconnected: ${client.id}${userId ? `, user: ${userId}` : ''
            }`,
        );
    }

    @SubscribeMessage('join:workspace')
    async handleJoinWorkspace(
        @ConnectedSocket() client: AuthenticatedWorkspaceSocket,
        @MessageBody() body: JoinWorkspaceRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        const user = this.ensureAuthenticated(client);

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
        @ConnectedSocket() client: AuthenticatedWorkspaceSocket,
        @MessageBody() body: JoinWorkspaceRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        this.ensureAuthenticated(client);

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

    private extractToken(client: AuthenticatedWorkspaceSocket): string {
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

    private ensureAuthenticated(
        client: AuthenticatedWorkspaceSocket,
    ): AuthenticatedWorkspaceSocketUser {
        if (!client.data.user) {
            throw new WsException('Unauthenticated socket');
        }

        return client.data.user;
    }
}
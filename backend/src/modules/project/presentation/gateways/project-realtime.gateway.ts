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
import { ProjectRealtimeAccessService } from '../../application/services/realtime/project-realtime-access.service';
import { ProjectRealtimeEventsService } from '../../application/services/realtime/project-realtime-events.service';
import { ProjectRealtimeEvent } from '../../application/types/project-realtime-event.types';
import { ProjectRealtimeRoom } from '../../application/types/project-realtime-room.types';
import { JoinProjectRoomDto } from '../dtos/requests/join-project-room.dto';
import type {
    AuthenticatedProjectSocket,
    AuthenticatedProjectSocketUser,
} from '../types/authenticated-project-socket.type';

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
export class ProjectRealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ProjectRealtimeGateway.name);

    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
        private readonly projectRealtimeEventsService: ProjectRealtimeEventsService,
        private readonly projectRealtimeAccessService: ProjectRealtimeAccessService,
    ) { }

    afterInit(server: Server): void {
        this.projectRealtimeEventsService.setServer(server);
        this.logger.log('Project realtime gateway initialized');
    }

    async handleConnection(client: AuthenticatedProjectSocket): Promise<void> {
        try {
            const token = this.extractToken(client);

            const payload = await this.tokenService.verifyAccessToken(token);

            client.data.user = {
                userId: payload.userId,
                email: payload.email,
            };

            await client.join(ProjectRealtimeRoom.user(payload.userId));

            client.emit(ProjectRealtimeEvent.Connected, {
                message: 'Connected to project realtime server',
                userId: payload.userId,
            });

            this.logger.log(
                `Project socket connected: ${client.id}, user: ${payload.userId}`,
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Unauthorized project socket connection: ${client.id}. Reason: ${message}`,
            );

            client.emit('realtime:error', {
                message: 'Unauthorized socket connection',
                reason: message,
            });

            client.disconnect(true);
        }
    }

    handleDisconnect(client: AuthenticatedProjectSocket): void {
        const userId = client.data.user?.userId;

        this.logger.log(
            `Project socket disconnected: ${client.id}${userId ? `, user: ${userId}` : ''
            }`,
        );
    }

    @SubscribeMessage('join:project')
    async handleJoinProject(
        @ConnectedSocket() client: AuthenticatedProjectSocket,
        @MessageBody() body: JoinProjectRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        const user = this.ensureAuthenticated(client);

        const canJoin = await this.projectRealtimeAccessService.canJoinProject({
            userId: user.userId,
            projectId: body.projectId,
        });

        if (!canJoin) {
            throw new WsException('You are not allowed to join this project room.');
        }

        const room = ProjectRealtimeRoom.project(body.projectId);

        await client.join(room);

        client.emit(ProjectRealtimeEvent.ProjectJoined, {
            projectId: body.projectId,
        });

        return {
            success: true,
            room,
        };
    }

    @SubscribeMessage('leave:project')
    async handleLeaveProject(
        @ConnectedSocket() client: AuthenticatedProjectSocket,
        @MessageBody() body: JoinProjectRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        this.ensureAuthenticated(client);

        const room = ProjectRealtimeRoom.project(body.projectId);

        await client.leave(room);

        client.emit(ProjectRealtimeEvent.ProjectLeft, {
            projectId: body.projectId,
        });

        return {
            success: true,
            room,
        };
    }

    private extractToken(client: AuthenticatedProjectSocket): string {
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
        client: AuthenticatedProjectSocket,
    ): AuthenticatedProjectSocketUser {
        if (!client.data.user) {
            throw new WsException('Unauthenticated socket');
        }

        return client.data.user;
    }
}
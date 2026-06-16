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

import { ProjectRealtimeAccessService } from '../../application/services/realtime/project-realtime-access.service';
import { ProjectRealtimeEventsService } from '../../application/services/realtime/project-realtime-events.service';
import { ProjectRealtimeEvent } from '../../application/types/project-realtime-event.types';
import { ProjectRealtimeRoom } from '../../application/types/project-realtime-room.types';
import { JoinProjectRoomDto } from '../dtos/requests/join-project-room.dto';

@UsePipes(realtimeValidationPipe)
@WebSocketGateway(realtimeGatewayOptions)
export class ProjectRealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ProjectRealtimeGateway.name);

    constructor(
        private readonly socketAuthenticationService: SocketAuthenticationService,
        private readonly projectRealtimeEventsService: ProjectRealtimeEventsService,
        private readonly projectRealtimeAccessService: ProjectRealtimeAccessService,
    ) { }

    afterInit(server: Server): void {
        this.projectRealtimeEventsService.setServer(server);
        this.logger.log('Project realtime gateway initialized');
    }

    async handleConnection(client: AuthenticatedSocket): Promise<void> {
        try {
            const user = await this.socketAuthenticationService.authenticate(client);

            await client.join(ProjectRealtimeRoom.user(user.userId));

            client.emit(ProjectRealtimeEvent.Connected, {
                message: 'Connected to project realtime server',
                userId: user.userId,
            });

            this.logger.log(
                `Project socket connected: ${client.id}, user: ${user.userId}`,
            );
        } catch (error) {
            disconnectUnauthorizedSocket({
                client,
                logger: this.logger,
                context: 'project',
                error,
            });
        }
    }

    handleDisconnect(client: AuthenticatedSocket): void {
        const userId = client.data.user?.userId;

        this.logger.log(
            `Project socket disconnected: ${client.id}${userId ? `, user: ${userId}` : ''
            }`,
        );
    }

    @SubscribeMessage('join:project')
    async handleJoinProject(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinProjectRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        const user = ensureAuthenticatedSocket(client);

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
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinProjectRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        ensureAuthenticatedSocket(client);

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
}
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
import { TaskRealtimeAccessService } from '../../application/services/realtime/task-realtime-access.service';
import { TaskRealtimeEventsService } from '../../application/services/realtime/task-realtime-events.service';
import { TaskRealtimeEvent } from '../../application/types/task-realtime-event.types';
import { TaskRealtimeRoom } from '../../application/types/task-realtime-room.types';
import { JoinTaskRoomDto } from '../dtos/requests/join-task-room.dto';
import type {
    AuthenticatedTaskSocket,
    AuthenticatedTaskSocketUser,
} from '../types/authenticated-task-socket.type';

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
export class TaskRealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(TaskRealtimeGateway.name);

    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
        private readonly taskRealtimeEventsService: TaskRealtimeEventsService,
        private readonly taskRealtimeAccessService: TaskRealtimeAccessService,
    ) { }

    afterInit(server: Server): void {
        this.taskRealtimeEventsService.setServer(server);
        this.logger.log('Task realtime gateway initialized');
    }

    async handleConnection(client: AuthenticatedTaskSocket): Promise<void> {
        try {
            const token = this.extractToken(client);

            const payload = await this.tokenService.verifyAccessToken(token);

            client.data.user = {
                userId: payload.userId,
                email: payload.email,
            };

            await client.join(TaskRealtimeRoom.user(payload.userId));

            client.emit(TaskRealtimeEvent.Connected, {
                message: 'Connected to task realtime server',
                userId: payload.userId,
            });

            this.logger.log(
                `Task socket connected: ${client.id}, user: ${payload.userId}`,
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Unauthorized task socket connection: ${client.id}. Reason: ${message}`,
            );

            client.emit('realtime:error', {
                message: 'Unauthorized socket connection',
                reason: message,
            });

            client.disconnect(true);
        }
    }

    handleDisconnect(client: AuthenticatedTaskSocket): void {
        const userId = client.data.user?.userId;

        this.logger.log(
            `Task socket disconnected: ${client.id}${userId ? `, user: ${userId}` : ''
            }`,
        );
    }

    @SubscribeMessage('join:task')
    async handleJoinTask(
        @ConnectedSocket() client: AuthenticatedTaskSocket,
        @MessageBody() body: JoinTaskRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        const user = this.ensureAuthenticated(client);

        const canJoin = await this.taskRealtimeAccessService.canJoinTask({
            userId: user.userId,
            taskId: body.taskId,
        });

        if (!canJoin) {
            throw new WsException('You are not allowed to join this task room.');
        }

        const room = TaskRealtimeRoom.task(body.taskId);

        await client.join(room);

        client.emit(TaskRealtimeEvent.TaskRoomJoined, {
            taskId: body.taskId,
        });

        return {
            success: true,
            room,
        };
    }

    @SubscribeMessage('leave:task')
    async handleLeaveTask(
        @ConnectedSocket() client: AuthenticatedTaskSocket,
        @MessageBody() body: JoinTaskRoomDto,
    ): Promise<{ success: boolean; room: string }> {
        this.ensureAuthenticated(client);

        const room = TaskRealtimeRoom.task(body.taskId);

        await client.leave(room);

        client.emit(TaskRealtimeEvent.TaskRoomLeft, {
            taskId: body.taskId,
        });

        return {
            success: true,
            room,
        };
    }

    private extractToken(client: AuthenticatedTaskSocket): string {
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
        client: AuthenticatedTaskSocket,
    ): AuthenticatedTaskSocketUser {
        if (!client.data.user) {
            throw new WsException('Unauthenticated socket');
        }

        return client.data.user;
    }
}
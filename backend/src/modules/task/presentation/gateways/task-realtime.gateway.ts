import { Logger, UseGuards, UsePipes } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';

import { disconnectUnauthorizedSocket } from '../../../../shared/infrastructure/realtime/helpers/disconnect-unauthorized-socket.helper';
import { SocketAuthenticationService } from '../../../../shared/infrastructure/realtime/services/socket-authentication.service';
import type { AuthenticatedSocket } from '../../../../shared/infrastructure/realtime/types/authenticated-socket.type';
import {
    realtimeGatewayOptions,
    realtimeValidationPipe,
} from '../../../../shared/infrastructure/realtime/config/realtime-gateway.config';

import { TaskRealtimeEventsService } from '../../application/services/task-realtime/task-realtime-events.service';
import { TaskRealtimeEvent } from '../../application/types/task-realtime-event.types';
import { TaskRealtimeRoom } from '../../application/types/task-realtime-room.types';

import { TaskRealtimeAuthenticatedGuard } from '../guards/task-realtime-authenticated.guard';
import { TaskRealtimeTaskAccessGuard } from '../guards/task-realtime-task-access.guard';

import { JoinTaskRoomDto } from '../dtos/requests/join-task-room.dto';

@UsePipes(realtimeValidationPipe)
@WebSocketGateway(realtimeGatewayOptions)
export class TaskRealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(TaskRealtimeGateway.name);

    constructor(
        private readonly socketAuthenticationService: SocketAuthenticationService,
        private readonly taskRealtimeEventsService: TaskRealtimeEventsService,
    ) { }

    afterInit(server: Server): void {
        this.taskRealtimeEventsService.setServer(server);
        this.logger.log('Task realtime gateway initialized');
    }

    async handleConnection(client: AuthenticatedSocket): Promise<void> {
        try {
            const user = await this.socketAuthenticationService.authenticate(client);

            await client.join(TaskRealtimeRoom.user(user.userId));

            client.emit(TaskRealtimeEvent.Connected, {
                message: 'Connected to task realtime server',
                userId: user.userId,
            });

            this.logger.log(
                `Task socket connected: ${client.id}, user: ${user.userId}`,
            );
        } catch (error) {
            disconnectUnauthorizedSocket({
                client,
                logger: this.logger,
                context: 'task',
                error,
            });
        }
    }

    handleDisconnect(client: AuthenticatedSocket): void {
        const userId = client.data.user?.userId;

        this.logger.log(
            `Task socket disconnected: ${client.id}${userId ? `, user: ${userId}` : ''
            }`,
        );
    }

    @UseGuards(TaskRealtimeAuthenticatedGuard, TaskRealtimeTaskAccessGuard)
    @SubscribeMessage('join:task')
    async handleJoinTask(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinTaskRoomDto,
    ): Promise<{ success: boolean; room: string }> {
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

    @UseGuards(TaskRealtimeAuthenticatedGuard)
    @SubscribeMessage('leave:task')
    async handleLeaveTask(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinTaskRoomDto,
    ): Promise<{ success: boolean; room: string }> {
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
}


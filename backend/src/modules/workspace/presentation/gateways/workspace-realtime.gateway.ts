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
import { ensureAuthenticatedSocket } from '../../../../shared/infrastructure/realtime/helpers/ensure-authenticated-socket.helper';
import { SocketAuthenticationService } from '../../../../shared/infrastructure/realtime/services/socket-authentication.service';
import type { AuthenticatedSocket } from '../../../../shared/infrastructure/realtime/types/authenticated-socket.type';
import {
    realtimeGatewayOptions,
    realtimeValidationPipe,
} from '../../../../shared/infrastructure/realtime/config/realtime-gateway.config';

import { RealtimeAuthenticatedGuard } from '../../../../shared/infrastructure/realtime/guards/realtime-authenticated.guard';

import { AddWorkspaceMemberService } from '../../application/services/members/add-workspace-member.service';
import { RemoveWorkspaceMemberService } from '../../application/services/members/remove-workspace-member.service';

import { WorkspaceRealtimeEventsService } from '../../application/services/workspace-realtime/workspace-realtime-events.service';
import { WorkspaceRealtimeEvent } from '../../application/types/workspace-realtime-event.types';
import { WorkspaceRealtimeRoom } from '../../application/types/workspace-realtime-room.types';

import { WorkspaceRealtimeAccessGuard } from '../guards/workspace-realtime-access.guard';

import { AddWorkspaceMemberSocketDto } from '../dtos/requests/add-workspace-member-socket.dto';
import { JoinWorkspaceRoomDto } from '../dtos/requests/join-workspace-room.dto';
import { RemoveWorkspaceMemberSocketDto } from '../dtos/requests/remove-workspace-member-socket.dto';

@UsePipes(realtimeValidationPipe)
@WebSocketGateway(realtimeGatewayOptions)
export class WorkspaceRealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(WorkspaceRealtimeGateway.name);

    constructor(
        private readonly socketAuthenticationService: SocketAuthenticationService,
        private readonly workspaceRealtimeEventsService: WorkspaceRealtimeEventsService,

        private readonly addWorkspaceMemberService: AddWorkspaceMemberService,
        private readonly removeWorkspaceMemberService: RemoveWorkspaceMemberService,
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


    @UseGuards(RealtimeAuthenticatedGuard, WorkspaceRealtimeAccessGuard)
    @SubscribeMessage('join:workspace')
    async handleJoinWorkspace(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinWorkspaceRoomDto,
    ): Promise<{ success: boolean; room: string }> {
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


    @UseGuards(RealtimeAuthenticatedGuard)
    @SubscribeMessage('leave:workspace')
    async handleLeaveWorkspace(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: JoinWorkspaceRoomDto,
    ): Promise<{ success: boolean; room: string }> {
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


    @UseGuards(RealtimeAuthenticatedGuard, WorkspaceRealtimeAccessGuard)
    @SubscribeMessage('workspace:add-member')
    async handleAddWorkspaceMember(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: AddWorkspaceMemberSocketDto,
    ) {
        const user = ensureAuthenticatedSocket(client);

        const member = await this.addWorkspaceMemberService.execute({
            workspaceId: body.workspaceId,
            actorUserId: user.userId,
            email: body.email,
            roleName: body.roleName,
        });

        return {
            success: true,
            message: 'Workspace member added successfully.',
            member,
        };
    }


    @UseGuards(RealtimeAuthenticatedGuard, WorkspaceRealtimeAccessGuard)
    @SubscribeMessage('workspace:remove-member')
    async handleRemoveWorkspaceMember(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() body: RemoveWorkspaceMemberSocketDto,
    ) {
        const user = ensureAuthenticatedSocket(client);

        const result = await this.removeWorkspaceMemberService.execute({
            workspaceId: body.workspaceId,
            actorUserId: user.userId,
            memberId: body.memberId,
        });

        return {
            success: true,
            message: result.message,
        };
    }
}
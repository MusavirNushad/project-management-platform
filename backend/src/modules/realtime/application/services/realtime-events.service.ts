import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

import { RealtimeEvent } from '../types/realtime-event.types';
import { RealtimeRoom } from '../types/realtime-room.types';

import type {
    ProjectMemberAddedEventPayload,
    ProjectMemberRemovedEventPayload,
    TaskAssignedEventPayload,
    TaskCreatedEventPayload,
    WorkspaceMemberAddedEventPayload,
    WorkspaceMemberRemovedEventPayload,
} from '../types/realtime-event.types';

@Injectable()
export class RealtimeEventsService {
    private readonly logger = new Logger(RealtimeEventsService.name);
    private server?: Server;

    setServer(server: Server): void {
        this.server = server;
        this.logger.log('Realtime server registered successfully');
    }

    private getServer(): Server | undefined {
        if (!this.server) {
            this.logger.warn('Realtime server is not initialized yet');
            return undefined;
        }

        return this.server;
    }

    emitWorkspaceMemberAdded(
        payload: WorkspaceMemberAddedEventPayload,
    ): void {
        const server = this.getServer();

        server
            ?.to(RealtimeRoom.workspace(payload.workspaceId))
            .emit(RealtimeEvent.WorkspaceMemberAdded, payload);

        server
            ?.to(RealtimeRoom.user(payload.memberId))
            .emit(RealtimeEvent.WorkspaceMemberAdded, payload);
    }

    emitWorkspaceMemberRemoved(
        payload: WorkspaceMemberRemovedEventPayload,
    ): void {
        const server = this.getServer();

        server
            ?.to(RealtimeRoom.workspace(payload.workspaceId))
            .emit(RealtimeEvent.WorkspaceMemberRemoved, payload);

        server
            ?.to(RealtimeRoom.user(payload.memberId))
            .emit(RealtimeEvent.WorkspaceMemberRemoved, payload);
    }

    emitProjectMemberAdded(payload: ProjectMemberAddedEventPayload): void {
        const server = this.getServer();

        server
            ?.to(RealtimeRoom.project(payload.projectId))
            .emit(RealtimeEvent.ProjectMemberAdded, payload);

        server
            ?.to(RealtimeRoom.user(payload.memberId))
            .emit(RealtimeEvent.ProjectMemberAdded, payload);
    }

    emitProjectMemberRemoved(payload: ProjectMemberRemovedEventPayload): void {
        const server = this.getServer();

        server
            ?.to(RealtimeRoom.project(payload.projectId))
            .emit(RealtimeEvent.ProjectMemberRemoved, payload);

        server
            ?.to(RealtimeRoom.user(payload.memberId))
            .emit(RealtimeEvent.ProjectMemberRemoved, payload);
    }

    emitTaskCreated(payload: TaskCreatedEventPayload): void {
        this.getServer()
            ?.to(RealtimeRoom.project(payload.projectId))
            .emit(RealtimeEvent.TaskCreated, payload);
    }

    emitTaskAssigned(payload: TaskAssignedEventPayload): void {
        const server = this.getServer();

        server
            ?.to(RealtimeRoom.project(payload.projectId))
            .emit(RealtimeEvent.TaskAssigned, payload);

        server
            ?.to(RealtimeRoom.user(payload.assigneeId))
            .emit(RealtimeEvent.TaskAssigned, payload);
    }
}
import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

import {
    ProjectRealtimeEvent,
    type ProjectMemberAddedEventPayload,
    type ProjectMemberRemovedEventPayload,
} from '../../types/project-realtime-event.types';
import { ProjectRealtimeRoom } from '../../types/project-realtime-room.types';

@Injectable()
export class ProjectRealtimeEventsService {
    private readonly logger = new Logger(ProjectRealtimeEventsService.name);
    private server?: Server;

    setServer(server: Server): void {
        this.server = server;
        this.logger.log('Project realtime server registered successfully');
    }

    private getServer(): Server | undefined {
        if (!this.server) {
            this.logger.warn('Project realtime server is not initialized yet');
            return undefined;
        }

        return this.server;
    }

    emitProjectMemberAdded(payload: ProjectMemberAddedEventPayload): void {
        const server = this.getServer();

        server
            ?.to(ProjectRealtimeRoom.project(payload.projectId))
            .emit(ProjectRealtimeEvent.ProjectMemberAdded, payload);

        server
            ?.to(ProjectRealtimeRoom.user(payload.memberId))
            .emit(ProjectRealtimeEvent.ProjectMemberAdded, payload);
    }

    emitProjectMemberRemoved(payload: ProjectMemberRemovedEventPayload): void {
        const server = this.getServer();

        server
            ?.to(ProjectRealtimeRoom.project(payload.projectId))
            .emit(ProjectRealtimeEvent.ProjectMemberRemoved, payload);

        server
            ?.to(ProjectRealtimeRoom.user(payload.memberId))
            .emit(ProjectRealtimeEvent.ProjectMemberRemoved, payload);
    }
}

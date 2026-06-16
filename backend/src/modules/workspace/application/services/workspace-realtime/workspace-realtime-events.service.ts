import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

import {
  WorkspaceRealtimeEvent,
  type WorkspaceMemberAddedEventPayload,
  type WorkspaceMemberRemovedEventPayload,
} from '../../types/workspace-realtime-event.types';
import { WorkspaceRealtimeRoom } from '../../types/workspace-realtime-room.types';

@Injectable()
export class WorkspaceRealtimeEventsService {
  private readonly logger = new Logger(WorkspaceRealtimeEventsService.name);
  private server?: Server;

  setServer(server: Server): void {
    this.server = server;
    this.logger.log('Workspace realtime server registered successfully');
  }

  private getServer(): Server | undefined {
    if (!this.server) {
      this.logger.warn('Workspace realtime server is not initialized yet');
      return undefined;
    }

    return this.server;
  }

  emitWorkspaceMemberAdded(
    payload: WorkspaceMemberAddedEventPayload,
  ): void {
    const server = this.getServer();

    server
      ?.to(WorkspaceRealtimeRoom.workspace(payload.workspaceId))
      .emit(WorkspaceRealtimeEvent.WorkspaceMemberAdded, payload);

    server
      ?.to(WorkspaceRealtimeRoom.user(payload.memberId))
      .emit(WorkspaceRealtimeEvent.WorkspaceMemberAdded, payload);
  }

  emitWorkspaceMemberRemoved(
    payload: WorkspaceMemberRemovedEventPayload,
  ): void {
    const server = this.getServer();

    server
      ?.to(WorkspaceRealtimeRoom.workspace(payload.workspaceId))
      .emit(WorkspaceRealtimeEvent.WorkspaceMemberRemoved, payload);

    server
      ?.to(WorkspaceRealtimeRoom.user(payload.memberId))
      .emit(WorkspaceRealtimeEvent.WorkspaceMemberRemoved, payload);
  }
}
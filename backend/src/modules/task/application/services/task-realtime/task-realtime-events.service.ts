import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

import {
  TaskRealtimeEvent,
  type TaskAssignedEventPayload,
  type TaskCreatedEventPayload,
} from '../../types/task-realtime-event.types';
import { TaskRealtimeRoom } from '../../types/task-realtime-room.types';

@Injectable()
export class TaskRealtimeEventsService {
  private readonly logger = new Logger(TaskRealtimeEventsService.name);
  private server?: Server;

  setServer(server: Server): void {
    this.server = server;
    this.logger.log('Task realtime server registered successfully');
  }

  private getServer(): Server | undefined {
    if (!this.server) {
      this.logger.warn('Task realtime server is not initialized yet');
      return undefined;
    }

    return this.server;
  }

  emitTaskCreated(payload: TaskCreatedEventPayload): void {
    this.getServer()
      ?.to(TaskRealtimeRoom.project(payload.projectId))
      .emit(TaskRealtimeEvent.TaskCreated, payload);
  }

  emitTaskAssigned(payload: TaskAssignedEventPayload): void {
    const server = this.getServer();

    server
      ?.to(TaskRealtimeRoom.project(payload.projectId))
      .emit(TaskRealtimeEvent.TaskAssigned, payload);

    server
      ?.to(TaskRealtimeRoom.user(payload.assigneeId))
      .emit(TaskRealtimeEvent.TaskAssigned, payload);
  }
}
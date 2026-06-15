import {
  Logger,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
import { RealtimeAccessService } from '../../application/services/realtime-access.service';
import { RealtimeEventsService } from '../../application/services/realtime-events.service';
import { RealtimeEvent } from '../../application/types/realtime-event.types';
import { RealtimeRoom } from '../../application/types/realtime-room.types';
import { JoinProjectRoomDto } from '../dtos/join-project-room.dto';
import { JoinTaskRoomDto } from '../dtos/join-task-room.dto';
import { JoinWorkspaceRoomDto } from '../dtos/join-workspace-room.dto';
import type {
  AuthenticatedSocket,
  AuthenticatedSocketUser,
} from '../types/authenticated-socket.type';

type JwtPayload = {
  sub: string;
  email: string;
  tokenType?: 'access' | 'refresh';
};

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
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly realtimeEventsService: RealtimeEventsService,
    private readonly realtimeAccessService: RealtimeAccessService,
  ) { }

  afterInit(server: Server): void {
    this.realtimeEventsService.setServer(server);
    this.logger.log('Realtime gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (payload.tokenType && payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      client.data.user = {
        userId: payload.sub,
        email: payload.email,
      };

      await client.join(RealtimeRoom.user(payload.sub));

      client.emit(RealtimeEvent.Connected, {
        message: 'Connected to realtime server',
        userId: payload.sub,
      });

      this.logger.log(`Socket connected: ${client.id}, user: ${payload.sub}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Unauthorized socket connection: ${client.id}. Reason: ${message}`,
      );

      client.emit('realtime:error', {
        message: 'Unauthorized socket connection',
        reason: message,
      });

      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data.user?.userId;

    this.logger.log(
      `Socket disconnected: ${client.id}${userId ? `, user: ${userId}` : ''}`,
    );
  }

  @SubscribeMessage('join:workspace')
  async handleJoinWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinWorkspaceRoomDto,
  ): Promise<{ success: boolean; room: string }> {
    const user = this.ensureAuthenticated(client);

    const canJoin = await this.realtimeAccessService.canJoinWorkspace({
      userId: user.userId,
      workspaceId: body.workspaceId,
    });

    if (!canJoin) {
      throw new WsException('You are not allowed to join this workspace room.');
    }

    const room = RealtimeRoom.workspace(body.workspaceId);
    await client.join(room);

    client.emit(RealtimeEvent.WorkspaceJoined, {
      workspaceId: body.workspaceId,
    });

    return {
      success: true,
      room,
    };
  }

  @SubscribeMessage('leave:workspace')
  async handleLeaveWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinWorkspaceRoomDto,
  ): Promise<{ success: boolean; room: string }> {
    this.ensureAuthenticated(client);

    const room = RealtimeRoom.workspace(body.workspaceId);
    await client.leave(room);

    client.emit(RealtimeEvent.WorkspaceLeft, {
      workspaceId: body.workspaceId,
    });

    return {
      success: true,
      room,
    };
  }

  @SubscribeMessage('join:project')
  async handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinProjectRoomDto,
  ): Promise<{ success: boolean; room: string }> {
    const user = this.ensureAuthenticated(client);

    const canJoin = await this.realtimeAccessService.canJoinProject({
      userId: user.userId,
      projectId: body.projectId,
    });

    if (!canJoin) {
      throw new WsException('You are not allowed to join this project room.');
    }

    const room = RealtimeRoom.project(body.projectId);
    await client.join(room);

    client.emit(RealtimeEvent.ProjectJoined, {
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
    this.ensureAuthenticated(client);

    const room = RealtimeRoom.project(body.projectId);
    await client.leave(room);

    client.emit(RealtimeEvent.ProjectLeft, {
      projectId: body.projectId,
    });

    return {
      success: true,
      room,
    };
  }

  @SubscribeMessage('join:task')
  async handleJoinTask(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinTaskRoomDto,
  ): Promise<{ success: boolean; room: string }> {
    const user = this.ensureAuthenticated(client);

    const canJoin = await this.realtimeAccessService.canJoinTask({
      userId: user.userId,
      taskId: body.taskId,
    });

    if (!canJoin) {
      throw new WsException('You are not allowed to join this task room.');
    }

    const room = RealtimeRoom.task(body.taskId);
    await client.join(room);

    client.emit(RealtimeEvent.TaskRoomJoined, {
      taskId: body.taskId,
    });

    return {
      success: true,
      room,
    };
  }

  @SubscribeMessage('leave:task')
  async handleLeaveTask(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: JoinTaskRoomDto,
  ): Promise<{ success: boolean; room: string }> {
    this.ensureAuthenticated(client);

    const room = RealtimeRoom.task(body.taskId);
    await client.leave(room);

    client.emit(RealtimeEvent.TaskRoomLeft, {
      taskId: body.taskId,
    });

    return {
      success: true,
      room,
    };
  }

  private extractToken(client: AuthenticatedSocket): string {
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
    client: AuthenticatedSocket,
  ): AuthenticatedSocketUser {
    if (!client.data.user) {
      throw new WsException('Unauthenticated socket');
    }

    return client.data.user;
  }
}

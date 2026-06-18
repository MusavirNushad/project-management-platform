import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import type { AuthenticatedSocket } from '../../../../shared/infrastructure/realtime/types/authenticated-socket.type';

import {
    TASK_REPOSITORY,
    type TaskRepositoryPort,
} from '../../domain/ports/task.repository.port';

import { TaskId } from '../../domain/value-objects/task-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

type JoinTaskRoomPayload = {
    taskId?: unknown;
};

@Injectable()
export class TaskRealtimeTaskAccessGuard implements CanActivate {
    private readonly logger = new Logger(TaskRealtimeTaskAccessGuard.name);

    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: TaskRepositoryPort,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();
        const payload = context.switchToWs().getData<JoinTaskRoomPayload>();

        const userId = client.data.user?.userId;
        const taskId = payload.taskId;

        if (!userId || typeof taskId !== 'string') {
            throw new WsException('You are not allowed to join this task room.');
        }

        try {
            const canJoinTask = await this.taskRepository.canUserAccessTask(
                TaskId.create(taskId),
                UserId.create(userId),
            );

            if (!canJoinTask) {
                throw new WsException('You are not allowed to join this task room.');
            }

            return true;
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }

            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Task realtime access check failed. taskId=${taskId}, userId=${userId}, reason=${message}`,
            );

            throw new WsException('You are not allowed to join this task room.');
        }
    }
}
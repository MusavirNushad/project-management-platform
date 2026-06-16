import { Inject, Injectable, Logger } from '@nestjs/common';

import {
    TASK_REPOSITORY,
    type TaskRepositoryPort,
} from '../../../domain/ports/task.repository.port';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

@Injectable()
export class TaskRealtimeAccessService {
    private readonly logger = new Logger(TaskRealtimeAccessService.name);

    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: TaskRepositoryPort,
    ) { }

    async canJoinTask(params: {
        userId: string;
        taskId: string;
    }): Promise<boolean> {
        try {
            const taskId = TaskId.create(params.taskId);
            const userId = UserId.create(params.userId);

            return await this.taskRepository.canUserAccessTask(taskId, userId);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Task realtime access check failed. taskId=${params.taskId}, userId=${params.userId}, reason=${message}`,
            );

            return false;
        }
    }
}
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AccessControlService } from '../../../access-control/application/services/access-control.service';

import { TASK_REPOSITORY } from '../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../domain/ports/task.repository.port';

import { TaskCommentId } from '../../domain/value-objects/task-comment-id.vo';

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        email: string;
    };
};

@Injectable()
export class TaskCommentAuthorOrProjectAdminGuard implements CanActivate {
    constructor(
        private readonly accessControlService: AccessControlService,

        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: TaskRepositoryPort,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const userId = request.user?.userId;
        const workspaceId = this.getRequiredParam(request, 'workspaceId');
        const projectId = this.getRequiredParam(request, 'projectId');
        const commentId = this.getRequiredParam(request, 'commentId');

        if (!userId || !workspaceId || !projectId || !commentId) {
            throw new ForbiddenException('Task comment access denied.');
        }

        const canManageProject = await this.accessControlService.canManageProject({
            workspaceId,
            projectId,
            userId,
        });

        if (canManageProject) {
            return true;
        }

        const comment = await this.taskRepository.findTaskCommentById(
            TaskCommentId.create(commentId),
        );

        if (!comment || comment.authorId !== userId) {
            throw new ForbiddenException('Task comment access denied.');
        }

        return true;
    }

    private getRequiredParam(request: Request, paramName: string): string | null {
        const value = request.params[paramName];

        if (typeof value !== 'string') {
            return null;
        }

        return value;
    }
}
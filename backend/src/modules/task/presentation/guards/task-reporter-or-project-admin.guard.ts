import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AccessControlService } from '../../../access-control/application/services/access-control.service';

import { TASK_REPOSITORY } from '../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../domain/ports/task.repository.port';

import { Inject } from '@nestjs/common';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        email: string;
    };
};

@Injectable()
export class TaskReporterOrProjectAdminGuard implements CanActivate {
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
        const taskId = this.getRequiredParam(request, 'taskId');

        if (!userId || !workspaceId || !projectId || !taskId) {
            throw new ForbiddenException('Task access denied.');
        }

        const canManageProject = await this.accessControlService.canManageProject({
            workspaceId,
            projectId,
            userId,
        });

        if (canManageProject) {
            return true;
        }

        const canAccessProject = await this.accessControlService.canAccessProject({
            workspaceId,
            projectId,
            userId,
        });

        if (!canAccessProject) {
            throw new ForbiddenException('Task access denied.');
        }

        const task = await this.taskRepository.findByProjectAndId(
            WorkspaceId.create(workspaceId),
            ProjectId.create(projectId),
            TaskId.create(taskId),
        );

        if (!task || task.getReporterId() !== userId) {
            throw new ForbiddenException('Task access denied.');
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
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AccessControlService } from '../../../access-control/application/services/access-control.service';

import { WORKLOG_REPOSITORY } from '../../domain/ports/worklog.repository.port';
import type { WorklogRepositoryPort } from '../../domain/ports/worklog.repository.port';

import { WorklogId } from '../../domain/value-objects/worklog-id.vo';

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        email: string;
    };
};

@Injectable()
export class WorklogOwnerOrProjectAdminGuard implements CanActivate {
    constructor(
        private readonly accessControlService: AccessControlService,

        @Inject(WORKLOG_REPOSITORY)
        private readonly worklogRepository: WorklogRepositoryPort,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const userId = request.user?.userId;
        const workspaceId = this.getRequiredParam(request, 'workspaceId');
        const projectId = this.getRequiredParam(request, 'projectId');
        const worklogId = this.getRequiredParam(request, 'worklogId');

        if (!userId || !workspaceId || !projectId || !worklogId) {
            throw new ForbiddenException('Worklog access denied.');
        }

        const canManageProject = await this.accessControlService.canManageProject({
            workspaceId,
            projectId,
            userId,
        });

        if (canManageProject) {
            return true;
        }

        const worklog = await this.worklogRepository.findById(
            WorklogId.create(worklogId),
        );

        if (!worklog || worklog.userId !== userId) {
            throw new ForbiddenException('Worklog access denied.');
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
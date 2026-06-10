import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AccessControlService } from '../../application/services/access-control.service';
import type { ProjectRoleName } from '../../application/types/access-control.types';
import { PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator';

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        email: string;
    };
};

@Injectable()
export class ProjectRoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly accessControlService: AccessControlService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles =
            this.reflector.getAllAndOverride<ProjectRoleName[]>(PROJECT_ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const userId = request.user?.userId;
        const workspaceId = this.getRequiredParam(request, 'workspaceId');
        const projectId = this.getRequiredParam(request, 'projectId');

        if (!userId || !workspaceId || !projectId) {
            throw new ForbiddenException('Project access denied.');
        }

        const hasAccess = await this.accessControlService.hasAnyProjectRole({
            workspaceId,
            projectId,
            userId,
            roles: requiredRoles,
            allowWorkspaceOwner: true,
        });

        if (!hasAccess) {
            throw new ForbiddenException('Project access denied.');
        }

        return true;
    }

    private getRequiredParam(
        request: Request,
        paramName: string,
    ): string | null {
        const value = request.params[paramName];

        if (typeof value !== 'string') {
            return null;
        }

        return value;
    }
}
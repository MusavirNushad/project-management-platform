import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AccessControlService } from '../../application/services/access-control.service';
import type { WorkspaceRoleName } from '../../application/types/access-control.types';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        email: string;
    };
};

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly accessControlService: AccessControlService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles =
            this.reflector.getAllAndOverride<WorkspaceRoleName[]>(
                WORKSPACE_ROLES_KEY,
                [context.getHandler(), context.getClass()],
            );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const userId = request.user?.userId;
        const workspaceId = this.getRequiredParam(request, 'workspaceId');

        if (!userId || !workspaceId) {
            throw new ForbiddenException('Workspace access denied.');
        }

        const hasAccess = await this.accessControlService.hasAnyWorkspaceRole({
            workspaceId,
            userId,
            roles: requiredRoles,
        });

        if (!hasAccess) {
            throw new ForbiddenException('Workspace access denied.');
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
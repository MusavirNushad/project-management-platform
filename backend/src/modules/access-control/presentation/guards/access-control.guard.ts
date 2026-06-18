import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AccessControlService } from '../../application/services/access-control.service';
import type { RequireRolesMetadata } from '../../application/types/access-control.types';
import { REQUIRE_ROLES_KEY } from '../decorators/require-roles.decorator';

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string;
  };
};

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessControlService: AccessControlService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RequireRolesMetadata>(
      REQUIRE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Access denied.');
    }

    if (requiredRoles.scope === 'workspace') {
      return this.checkWorkspaceAccess({
        request,
        userId,
        requiredRoles,
      });
    }

    return this.checkProjectAccess({
      request,
      userId,
      requiredRoles,
    });
  }

  private async checkWorkspaceAccess(params: {
    request: Request;
    userId: string;
    requiredRoles: Extract<RequireRolesMetadata, { scope: 'workspace' }>;
  }): Promise<boolean> {
    const workspaceId = this.getRequiredParam(params.request, 'workspaceId');

    if (!workspaceId) {
      throw new ForbiddenException('Workspace access denied.');
    }

    const hasAccess = await this.accessControlService.hasAnyWorkspaceRole({
      workspaceId,
      userId: params.userId,
      roles: params.requiredRoles.roles,
    });

    if (!hasAccess) {
      throw new ForbiddenException('Workspace access denied.');
    }

    return true;
  }

  private async checkProjectAccess(params: {
    request: Request;
    userId: string;
    requiredRoles: Extract<RequireRolesMetadata, { scope: 'project' }>;
  }): Promise<boolean> {
    const workspaceId = this.getRequiredParam(params.request, 'workspaceId');
    const projectId = this.getRequiredParam(params.request, 'projectId');

    if (!workspaceId || !projectId) {
      throw new ForbiddenException('Project access denied.');
    }

    const hasAccess = await this.accessControlService.hasAnyProjectRole({
      workspaceId,
      projectId,
      userId: params.userId,
      roles: params.requiredRoles.roles,
      allowWorkspaceOwner: params.requiredRoles.allowWorkspaceOwner ?? true,
    });

    if (!hasAccess) {
      throw new ForbiddenException('Project access denied.');
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



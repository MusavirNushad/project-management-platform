import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

import type {
  AccessControlRepositoryPort,
  FindProjectMemberRoleInput,
  FindWorkspaceMemberRoleInput,
  IsProjectInWorkspaceInput,
} from '../../application/ports/access-control.repository.port';

import type {
  ProjectRoleName,
  WorkspaceRoleName,
} from '../../application/types/access-control.types';

@Injectable()
export class PrismaAccessControlRepository implements AccessControlRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findWorkspaceMemberRole(
    input: FindWorkspaceMemberRoleInput,
  ): Promise<WorkspaceRoleName | null> {
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: input.workspaceId,
        userId: input.userId,
      },
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    const roleName = member?.role.name;

    return roleName ? (roleName as WorkspaceRoleName) : null;
  }

  async findProjectMemberRole(
    input: FindProjectMemberRoleInput,
  ): Promise<ProjectRoleName | null> {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId: input.projectId,
        userId: input.userId,
      },
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    const roleName = member?.role.name;

    return roleName ? (roleName as ProjectRoleName) : null;
  }

  async isProjectInWorkspace(
    input: IsProjectInWorkspaceInput,
  ): Promise<boolean> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: input.projectId,
        workspaceId: input.workspaceId,
      },
      select: {
        id: true,
      },
    });

    return project !== null;
  }
}

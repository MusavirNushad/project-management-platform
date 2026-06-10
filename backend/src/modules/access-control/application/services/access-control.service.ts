// src/modules/access-control/application/services/access-control.service.ts

import { Inject, Injectable } from '@nestjs/common';

import { ACCESS_CONTROL_REPOSITORY } from '../ports/access-control.repository.port';
import type { AccessControlRepositoryPort } from '../ports/access-control.repository.port';

import type {
    ProjectRoleName,
    WorkspaceRoleName,
} from '../types/access-control.types';

type WorkspaceAccessInput = {
    workspaceId: string;
    userId: string;
};

type ProjectAccessInput = {
    workspaceId: string;
    projectId: string;
    userId: string;
};

type WorkspaceRoleInput = WorkspaceAccessInput & {
    roles: WorkspaceRoleName[];
};

type ProjectRoleInput = ProjectAccessInput & {
    roles: ProjectRoleName[];
    allowWorkspaceOwner?: boolean;
};

@Injectable()
export class AccessControlService {
    constructor(
        @Inject(ACCESS_CONTROL_REPOSITORY)
        private readonly accessControlRepository: AccessControlRepositoryPort,
    ) { }

    async isWorkspaceOwner(input: WorkspaceAccessInput): Promise<boolean> {
        const role = await this.accessControlRepository.findWorkspaceMemberRole({
            workspaceId: input.workspaceId,
            userId: input.userId,
        });

        return role === 'OWNER';
    }

    async isWorkspaceMember(input: WorkspaceAccessInput): Promise<boolean> {
        const role = await this.accessControlRepository.findWorkspaceMemberRole({
            workspaceId: input.workspaceId,
            userId: input.userId,
        });

        return role !== null;
    }

    async hasAnyWorkspaceRole(input: WorkspaceRoleInput): Promise<boolean> {
        const role = await this.accessControlRepository.findWorkspaceMemberRole({
            workspaceId: input.workspaceId,
            userId: input.userId,
        });

        if (!role) {
            return false;
        }

        return input.roles.includes(role);
    }

    async canAccessWorkspace(input: WorkspaceAccessInput): Promise<boolean> {
        return this.hasAnyWorkspaceRole({
            workspaceId: input.workspaceId,
            userId: input.userId,
            roles: ['OWNER', 'ADMIN', 'MEMBER'],
        });
    }

    async canManageWorkspace(input: WorkspaceAccessInput): Promise<boolean> {
        return this.hasAnyWorkspaceRole({
            workspaceId: input.workspaceId,
            userId: input.userId,
            roles: ['OWNER', 'ADMIN'],
        });
    }

    async isProjectMember(input: ProjectAccessInput): Promise<boolean> {
        const isProjectInWorkspace =
            await this.accessControlRepository.isProjectInWorkspace({
                workspaceId: input.workspaceId,
                projectId: input.projectId,
            });

        if (!isProjectInWorkspace) {
            return false;
        }

        const role = await this.accessControlRepository.findProjectMemberRole({
            projectId: input.projectId,
            userId: input.userId,
        });

        return role !== null;
    }

    async hasAnyProjectRole(input: ProjectRoleInput): Promise<boolean> {
        const isProjectInWorkspace =
            await this.accessControlRepository.isProjectInWorkspace({
                workspaceId: input.workspaceId,
                projectId: input.projectId,
            });

        if (!isProjectInWorkspace) {
            return false;
        }

        if (input.allowWorkspaceOwner ?? true) {
            const isWorkspaceOwner = await this.isWorkspaceOwner({
                workspaceId: input.workspaceId,
                userId: input.userId,
            });

            if (isWorkspaceOwner) {
                return true;
            }
        }

        const role = await this.accessControlRepository.findProjectMemberRole({
            projectId: input.projectId,
            userId: input.userId,
        });

        if (!role) {
            return false;
        }

        return input.roles.includes(role);
    }

    async canAccessProject(input: ProjectAccessInput): Promise<boolean> {
        return this.hasAnyProjectRole({
            workspaceId: input.workspaceId,
            projectId: input.projectId,
            userId: input.userId,
            roles: ['ADMIN', 'MEMBER'],
            allowWorkspaceOwner: true,
        });
    }

    async canManageProject(input: ProjectAccessInput): Promise<boolean> {
        return this.hasAnyProjectRole({
            workspaceId: input.workspaceId,
            projectId: input.projectId,
            userId: input.userId,
            roles: ['ADMIN'],
            allowWorkspaceOwner: true,
        });
    }
}
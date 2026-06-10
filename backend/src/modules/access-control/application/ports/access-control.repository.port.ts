// src/modules/access-control/application/ports/access-control.repository.port.ts

import type {
    ProjectRoleName,
    WorkspaceRoleName,
} from '../types/access-control.types';

export const ACCESS_CONTROL_REPOSITORY = Symbol('ACCESS_CONTROL_REPOSITORY');

export type FindWorkspaceMemberRoleInput = {
    workspaceId: string;
    userId: string;
};

export type FindProjectMemberRoleInput = {
    projectId: string;
    userId: string;
};

export type IsProjectInWorkspaceInput = {
    workspaceId: string;
    projectId: string;
};

export interface AccessControlRepositoryPort {
    findWorkspaceMemberRole(
        input: FindWorkspaceMemberRoleInput,
    ): Promise<WorkspaceRoleName | null>;

    findProjectMemberRole(
        input: FindProjectMemberRoleInput,
    ): Promise<ProjectRoleName | null>;

    isProjectInWorkspace(input: IsProjectInWorkspaceInput): Promise<boolean>;
}
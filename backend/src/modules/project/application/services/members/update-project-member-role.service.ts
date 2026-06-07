import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type {
    ProjectAssignableRoleName,
    ProjectMemberDetails,
    ProjectRepositoryPort,
} from '../../../domain/ports/project.repository.port';

import {
    ProjectMemberNotFoundError,
    ProjectMemberProjectMismatchError,
    ProjectNotFoundError,
    ProjectRoleNotFoundError,
    ProjectWorkspaceAccessDeniedError,
    ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ProjectMemberId } from '../../../domain/value-objects/project-member-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

import { ProjectMemberPermissionService } from './project-member-permission.service';

export type UpdateProjectMemberRoleInput = {
    workspaceId: string;
    projectId: string;
    memberId: string;
    actorUserId: string;
    roleName: ProjectAssignableRoleName;
};

export type UpdateProjectMemberRoleResult = ProjectMemberDetails;

@Injectable()
export class UpdateProjectMemberRoleService {
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryPort,
        private readonly projectMemberPermissionService: ProjectMemberPermissionService,
    ) { }

    async execute(
        input: UpdateProjectMemberRoleInput,
    ): Promise<UpdateProjectMemberRoleResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const memberId = ProjectMemberId.create(input.memberId);
        const actorUserId = UserId.create(input.actorUserId);

        const workspaceExists =
            await this.projectRepository.workspaceExists(workspaceId);

        if (!workspaceExists) {
            throw new ProjectWorkspaceNotFoundError();
        }

        const project = await this.projectRepository.findByWorkspaceAndId(
            workspaceId,
            projectId,
        );

        if (!project) {
            throw new ProjectNotFoundError();
        }

        const canManageProjectMembers =
            await this.projectMemberPermissionService.canManageProjectMembers({
                workspaceId,
                projectId,
                actorUserId,
            });

        if (!canManageProjectMembers) {
            throw new ProjectWorkspaceAccessDeniedError();
        }

        const member =
            await this.projectRepository.findProjectMemberDetailsById(memberId);

        if (!member) {
            throw new ProjectMemberNotFoundError();
        }

        if (member.projectId !== projectId.value) {
            throw new ProjectMemberProjectMismatchError();
        }

        const roleId = await this.projectRepository.findRoleIdByName(input.roleName);

        if (!roleId) {
            throw new ProjectRoleNotFoundError();
        }

        return this.projectRepository.updateProjectMemberRoleById(memberId, roleId);
    }
}

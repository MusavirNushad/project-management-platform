import { Inject, Injectable } from '@nestjs/common';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type { SprintRepositoryPort } from '../../../domain/ports/sprint.repository.port';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

type CanManageSprintsInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanViewSprintsInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

@Injectable()
export class SprintPermissionService {
    constructor(
        @Inject(SPRINT_REPOSITORY)
        private readonly sprintRepository: SprintRepositoryPort,
    ) { }

    async canManageSprints(input: CanManageSprintsInput): Promise<boolean> {
        const isWorkspaceOwner = await this.sprintRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.sprintRepository.findProjectMemberByProjectAndUser(
                input.projectId,
                input.userId,
            );

        return projectMember?.role.name === 'ADMIN';
    }

    async canViewSprints(input: CanViewSprintsInput): Promise<boolean> {
        const isWorkspaceOwner = await this.sprintRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.sprintRepository.isProjectMember(
            input.projectId,
            input.userId,
        );
    }
}

import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type { ProjectRepositoryPort } from '../../../domain/ports/project.repository.port';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

@Injectable()
export class ProjectMemberPermissionService {
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryPort,
    ) { }

    async canManageProjectMembers(params: {
        workspaceId: WorkspaceId;
        projectId: ProjectId;
        actorUserId: UserId;
    }): Promise<boolean> {
        const isWorkspaceOwner = await this.projectRepository.isWorkspaceOwner(
            params.workspaceId,
            params.actorUserId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.projectRepository.findProjectMemberDetailsByProjectAndUser(
                params.projectId,
                params.actorUserId,
            );

        return projectMember?.role.name === 'ADMIN';
    }
}

import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type {
    ProjectMemberDetails,
    ProjectRepositoryPort,
} from '../../../domain/ports/project.repository.port';

import {
    ProjectNotFoundError,
    ProjectWorkspaceAccessDeniedError,
    ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type ProjectMemberListItemResult = ProjectMemberDetails;

export type GetProjectMembersInput = {
    workspaceId: string;
    projectId: string;
    userId: string;
};

export type GetProjectMembersResult = {
    items: ProjectMemberListItemResult[];
    total: number;
};

@Injectable()
export class GetProjectMembersService {
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryPort,
    ) { }

    async execute(input: GetProjectMembersInput): Promise<GetProjectMembersResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const userId = UserId.create(input.userId);

        const workspaceExists =
            await this.projectRepository.workspaceExists(workspaceId);

        if (!workspaceExists) {
            throw new ProjectWorkspaceNotFoundError();
        }

        const isWorkspaceMember = await this.projectRepository.isWorkspaceMember(
            workspaceId,
            userId,
        );

        if (!isWorkspaceMember) {
            throw new ProjectWorkspaceAccessDeniedError();
        }

        const project = await this.projectRepository.findByWorkspaceAndId(
            workspaceId,
            projectId,
        );

        if (!project) {
            throw new ProjectNotFoundError();
        }

        const members =
            await this.projectRepository.findProjectMembersByProjectId(projectId);

        return {
            items: members,
            total: members.length,
        };
    }
}

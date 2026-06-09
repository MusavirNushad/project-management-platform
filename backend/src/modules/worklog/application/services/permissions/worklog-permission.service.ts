import { Inject, Injectable } from '@nestjs/common';

import { WORKLOG_REPOSITORY } from '../../../domain/ports/worklog.repository.port';
import type { WorklogRepositoryPort } from '../../../domain/ports/worklog.repository.port';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

type CanCreateWorklogInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanViewTaskWorklogsInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanUpdateWorklogInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
    worklogUserId: UserId;
};

type CanDeleteWorklogInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
    worklogUserId: UserId;
};



@Injectable()
export class WorklogPermissionService {
    constructor(
        @Inject(WORKLOG_REPOSITORY)
        private readonly worklogRepository: WorklogRepositoryPort,
    ) { }

    async canCreateWorklog(input: CanCreateWorklogInput): Promise<boolean> {
        const isWorkspaceOwner = await this.worklogRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.worklogRepository.isProjectMember(
            input.projectId,
            input.userId,
        );
    }

    async canViewTaskWorklogs(
        input: CanViewTaskWorklogsInput,
    ): Promise<boolean> {
        const isWorkspaceOwner = await this.worklogRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.worklogRepository.isProjectMember(
            input.projectId,
            input.userId,
        );
    }

    async canUpdateWorklog(input: CanUpdateWorklogInput): Promise<boolean> {
        if (input.userId.equals(input.worklogUserId)) {
            return true;
        }

        const isWorkspaceOwner = await this.worklogRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.worklogRepository.findProjectMemberByProjectAndUser(
                input.projectId,
                input.userId,
            );

        return projectMember?.role.name === 'ADMIN';
    }

    async canDeleteWorklog(input: CanDeleteWorklogInput): Promise<boolean> {
        if (input.userId.equals(input.worklogUserId)) {
            return true;
        }

        const isWorkspaceOwner = await this.worklogRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.worklogRepository.findProjectMemberByProjectAndUser(
                input.projectId,
                input.userId,
            );

        return projectMember?.role.name === 'ADMIN';
    }
}
import { Inject, Injectable } from '@nestjs/common';

import { WorklogPermissionService } from '../permissions/worklog-permission.service';

import { WORKLOG_REPOSITORY } from '../../../domain/ports/worklog.repository.port';
import type { WorklogRepositoryPort } from '../../../domain/ports/worklog.repository.port';

import {
    WorklogAccessDeniedError,
    WorklogNotFoundError,
    WorklogProjectNotFoundError,
    WorklogTaskMismatchError,
    WorklogTaskNotFoundError,
    WorklogWorkspaceNotFoundError,
} from '../../../domain/errors/worklog-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorklogId } from '../../../domain/value-objects/worklog-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type DeleteWorklogInput = {
    workspaceId: string;
    projectId: string;
    taskId: string;
    worklogId: string;
    userId: string;
};

export type DeleteWorklogResult = {
    message: string;
};

@Injectable()
export class DeleteWorklogService {
    constructor(
        @Inject(WORKLOG_REPOSITORY)
        private readonly worklogRepository: WorklogRepositoryPort,
        private readonly worklogPermissionService: WorklogPermissionService,
    ) { }

    async execute(input: DeleteWorklogInput): Promise<DeleteWorklogResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const taskId = TaskId.create(input.taskId);
        const worklogId = WorklogId.create(input.worklogId);
        const userId = UserId.create(input.userId);

        const workspaceExists =
            await this.worklogRepository.workspaceExists(workspaceId);

        if (!workspaceExists) {
            throw new WorklogWorkspaceNotFoundError();
        }

        const projectExists =
            await this.worklogRepository.projectExistsInWorkspace(
                workspaceId,
                projectId,
            );

        if (!projectExists) {
            throw new WorklogProjectNotFoundError();
        }

        const task = await this.worklogRepository.findTaskByProjectAndId(
            workspaceId,
            projectId,
            taskId,
        );

        if (!task) {
            throw new WorklogTaskNotFoundError();
        }

        const existingWorklog = await this.worklogRepository.findById(worklogId);

        if (!existingWorklog) {
            throw new WorklogNotFoundError();
        }

        if (existingWorklog.taskId !== taskId.value) {
            throw new WorklogTaskMismatchError();
        }

        const worklogUserId = UserId.create(existingWorklog.userId);

        const canDeleteWorklog =
            await this.worklogPermissionService.canDeleteWorklog({
                workspaceId,
                projectId,
                userId,
                worklogUserId,
            });

        if (!canDeleteWorklog) {
            throw new WorklogAccessDeniedError();
        }

        await this.worklogRepository.deleteById(worklogId);

        return {
            message: 'Worklog deleted successfully.',
        };
    }
}
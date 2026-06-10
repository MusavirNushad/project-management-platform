import { Inject, Injectable } from '@nestjs/common';

import { WorklogPermissionService } from '../permissions/worklog-permission.service';

import { WORKLOG_REPOSITORY } from '../../../domain/ports/worklog.repository.port';
import type {
  WorklogDetails,
  WorklogRepositoryPort,
} from '../../../domain/ports/worklog.repository.port';

import {
  WorklogProjectAccessDeniedError,
  WorklogProjectNotFoundError,
  WorklogTaskNotFoundError,
  WorklogWorkspaceNotFoundError,
} from '../../../domain/errors/worklog-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type TaskWorklogListItemResult = WorklogDetails;

export type GetTaskWorklogsInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  userId: string;
};

export type GetTaskWorklogsResult = {
  items: TaskWorklogListItemResult[];
  total: number;
};

@Injectable()
export class GetTaskWorklogsService {
  constructor(
    @Inject(WORKLOG_REPOSITORY)
    private readonly worklogRepository: WorklogRepositoryPort,
    private readonly worklogPermissionService: WorklogPermissionService,
  ) {}

  async execute(input: GetTaskWorklogsInput): Promise<GetTaskWorklogsResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const userId = UserId.create(input.userId);

    const workspaceExists =
      await this.worklogRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new WorklogWorkspaceNotFoundError();
    }

    const projectExists = await this.worklogRepository.projectExistsInWorkspace(
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

    const canViewTaskWorklogs =
      await this.worklogPermissionService.canViewTaskWorklogs({
        workspaceId,
        projectId,
        userId,
      });

    if (!canViewTaskWorklogs) {
      throw new WorklogProjectAccessDeniedError();
    }

    const worklogs = await this.worklogRepository.findByTaskId(taskId);

    return {
      items: worklogs,
      total: worklogs.length,
    };
  }
}

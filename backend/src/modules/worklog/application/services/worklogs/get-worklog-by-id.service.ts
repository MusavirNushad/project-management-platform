import { Inject, Injectable } from '@nestjs/common';

import { WORKLOG_REPOSITORY } from '../../../domain/ports/worklog.repository.port';
import type {
  WorklogDetails,
  WorklogRepositoryPort,
} from '../../../domain/ports/worklog.repository.port';

import {
  WorklogNotFoundError,
  WorklogProjectNotFoundError,
  WorklogTaskMismatchError,
  WorklogTaskNotFoundError,
  WorklogWorkspaceNotFoundError,
} from '../../../domain/errors/worklog-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { WorklogId } from '../../../domain/value-objects/worklog-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type GetWorklogByIdInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  worklogId: string;
};

export type GetWorklogByIdResult = WorklogDetails;

@Injectable()
export class GetWorklogByIdService {
  constructor(
    @Inject(WORKLOG_REPOSITORY)
    private readonly worklogRepository: WorklogRepositoryPort,
  ) { }

  async execute(input: GetWorklogByIdInput): Promise<GetWorklogByIdResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const worklogId = WorklogId.create(input.worklogId);

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

    const worklog = await this.worklogRepository.findById(worklogId);

    if (!worklog) {
      throw new WorklogNotFoundError();
    }

    if (worklog.taskId !== taskId.value) {
      throw new WorklogTaskMismatchError();
    }

    return worklog;
  }
}
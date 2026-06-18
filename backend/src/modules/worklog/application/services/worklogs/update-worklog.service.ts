import { Inject, Injectable } from '@nestjs/common';

import { WORKLOG_REPOSITORY } from '../../../domain/ports/worklog.repository.port';
import type {
  WorklogDetails,
  WorklogRepositoryPort,
} from '../../../domain/ports/worklog.repository.port';

import { WorklogEntity } from '../../../domain/entities/worklog.entity';

import {
  InvalidWorklogDateRangeError,
  WorklogNotFoundError,
  WorklogProjectNotFoundError,
  WorklogTaskMismatchError,
  WorklogTaskNotFoundError,
  WorklogWorkspaceNotFoundError,
} from '../../../domain/errors/worklog-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorklogDescription } from '../../../domain/value-objects/worklog-description.vo';
import { WorklogId } from '../../../domain/value-objects/worklog-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type UpdateWorklogInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  worklogId: string;
  startedAt?: string;
  endedAt?: string | null;
  description?: string | null;
};

export type UpdateWorklogResult = WorklogDetails;

@Injectable()
export class UpdateWorklogService {
  constructor(
    @Inject(WORKLOG_REPOSITORY)
    private readonly worklogRepository: WorklogRepositoryPort,
  ) { }

  async execute(input: UpdateWorklogInput): Promise<UpdateWorklogResult> {
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

    const existingWorklog = await this.worklogRepository.findById(worklogId);

    if (!existingWorklog) {
      throw new WorklogNotFoundError();
    }

    if (existingWorklog.taskId !== taskId.value) {
      throw new WorklogTaskMismatchError();
    }

    const worklog = WorklogEntity.restore({
      id: WorklogId.create(existingWorklog.id),
      userId: UserId.create(existingWorklog.userId),
      projectId: ProjectId.create(existingWorklog.projectId),
      taskId: TaskId.create(existingWorklog.taskId),
      startedAt: existingWorklog.startedAt,
      endedAt: existingWorklog.endedAt,
      durationMin: existingWorklog.durationMin,
      description: WorklogDescription.create(existingWorklog.description),
      createdAt: existingWorklog.createdAt,
    });

    worklog.updateDetails({
      startedAt:
        input.startedAt !== undefined
          ? this.parseRequiredDate(input.startedAt)
          : undefined,
      endedAt:
        input.endedAt !== undefined
          ? this.parseOptionalDate(input.endedAt)
          : undefined,
      description:
        input.description !== undefined
          ? WorklogDescription.create(input.description)
          : undefined,
    });

    return this.worklogRepository.update(worklog);
  }

  private parseRequiredDate(value: string): Date {
    if (!value || typeof value !== 'string') {
      throw new InvalidWorklogDateRangeError();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new InvalidWorklogDateRangeError();
    }

    return date;
  }

  private parseOptionalDate(value?: string | null): Date | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return null;
    }

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      throw new InvalidWorklogDateRangeError();
    }

    return date;
  }
}
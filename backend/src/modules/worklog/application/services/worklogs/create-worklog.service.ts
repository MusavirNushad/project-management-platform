import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { WORKLOG_REPOSITORY } from '../../../domain/ports/worklog.repository.port';
import type {
  WorklogDetails,
  WorklogRepositoryPort,
} from '../../../domain/ports/worklog.repository.port';

import { WorklogEntity } from '../../../domain/entities/worklog.entity';

import {
  InvalidWorklogDateRangeError,
  WorklogProjectNotFoundError,
  WorklogTaskNotFoundError,
  WorklogWorkspaceNotFoundError,
} from '../../../domain/errors/worklog-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorklogDescription } from '../../../domain/value-objects/worklog-description.vo';
import { WorklogId } from '../../../domain/value-objects/worklog-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type CreateWorklogInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  userId: string;
  startedAt: string;
  endedAt?: string | null;
  description?: string | null;
};

export type CreateWorklogResult = WorklogDetails;

@Injectable()
export class CreateWorklogService {
  constructor(
    @Inject(WORKLOG_REPOSITORY)
    private readonly worklogRepository: WorklogRepositoryPort,
  ) { }

  async execute(input: CreateWorklogInput): Promise<CreateWorklogResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const userId = UserId.create(input.userId);

    const startedAt = this.parseRequiredDate(input.startedAt);
    const endedAt = this.parseOptionalDate(input.endedAt);
    const description = WorklogDescription.create(input.description);

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

    const worklog = WorklogEntity.create({
      id: WorklogId.create(randomUUID()),
      userId,
      projectId,
      taskId,
      startedAt,
      endedAt,
      description,
    });

    return this.worklogRepository.save(worklog);
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
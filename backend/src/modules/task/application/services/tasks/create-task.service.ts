import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { TaskPermissionService } from '../permissions/task-permission.service';
import { RealtimeEventsService } from '../../../../realtime/application/services/realtime-events.service';

import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../../domain/ports/task.repository.port';

import {
  TaskEntity,
  type TaskPriority,
  type TaskStatus,
} from '../../../domain/entities/task.entity';

import {
  InvalidTaskDateRangeError,
  TaskProjectAccessDeniedError,
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskDescription } from '../../../domain/value-objects/task-description.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { TaskTitle } from '../../../domain/value-objects/task-title.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type CreateTaskInput = {
  workspaceId: string;
  projectId: string;
  reporterId: string;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  startDate?: string | null;
  dueDate?: string | null;
};

export type CreateTaskResult = {
  id: string;
  workspaceId: string;
  projectId: string;
  reporterId: string;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  isCompleted: boolean;
  attachments: unknown[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CreateTaskService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
    private readonly taskPermissionService: TaskPermissionService,
    private readonly realtimeEventsService: RealtimeEventsService,
  ) { }

  async execute(input: CreateTaskInput): Promise<CreateTaskResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const reporterId = UserId.create(input.reporterId);

    const title = TaskTitle.create(input.title);
    const description = TaskDescription.create(input.description);

    const startDate = this.parseOptionalDate(input.startDate);
    const dueDate = this.parseOptionalDate(input.dueDate);

    const workspaceExists =
      await this.taskRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new TaskWorkspaceNotFoundError();
    }

    const projectExists = await this.taskRepository.projectExistsInWorkspace(
      workspaceId,
      projectId,
    );

    if (!projectExists) {
      throw new TaskProjectNotFoundError();
    }

    const canCreateTask = await this.taskPermissionService.canCreateTask({
      workspaceId,
      projectId,
      userId: reporterId,
    });

    if (!canCreateTask) {
      throw new TaskProjectAccessDeniedError();
    }

    const task = TaskEntity.create({
      id: TaskId.create(randomUUID()),
      workspaceId,
      projectId,
      reporterId,
      title,
      description,
      priority: input.priority,
      startDate,
      dueDate,
      attachments: [],
    });

    const savedTask = await this.taskRepository.save(task);

    this.realtimeEventsService.emitTaskCreated({
      taskId: savedTask.getId(),
      workspaceId: savedTask.getWorkspaceId(),
      projectId: savedTask.getProjectId(),
      title: savedTask.getTitle(),
      status: savedTask.getStatus(),
      priority: savedTask.getPriority(),
      assigneeIds: savedTask.getAssignees().map((assignee) => assignee.getUserId()),
      createdBy: {
        userId: savedTask.getReporterId(),
      },
      createdAt: savedTask.getCreatedAt().toISOString(),
    });

    return this.toResult(savedTask);


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
      throw new InvalidTaskDateRangeError();
    }

    return date;
  }

  private toResult(task: TaskEntity): CreateTaskResult {
    return {
      id: task.getId(),
      workspaceId: task.getWorkspaceId(),
      projectId: task.getProjectId(),
      reporterId: task.getReporterId(),
      assigneeId: task.getAssigneeId(),
      title: task.getTitle(),
      description: task.getDescription(),
      status: task.getStatus(),
      priority: task.getPriority(),
      startDate: task.getStartDate(),
      dueDate: task.getDueDate(),
      completedAt: task.getCompletedAt(),
      isCompleted: task.getIsCompleted(),
      attachments: task.getAttachments(),
      createdAt: task.getCreatedAt(),
      updatedAt: task.getUpdatedAt(),
    };
  }
}

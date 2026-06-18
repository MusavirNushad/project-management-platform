import { Inject, Injectable } from '@nestjs/common';



import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../../domain/ports/task.repository.port';

import type {
  TaskEntity,
  TaskPriority,
  TaskStatus,
} from '../../../domain/entities/task.entity';

import {
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type ProjectTaskListItemResult = {
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

export type GetProjectTasksInput = {
  workspaceId: string;
  projectId: string;
};

export type GetProjectTasksResult = {
  items: ProjectTaskListItemResult[];
  total: number;
};

@Injectable()
export class GetProjectTasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
  ) { }

  async execute(input: GetProjectTasksInput): Promise<GetProjectTasksResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);

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


    const tasks = await this.taskRepository.findByProjectId(
      workspaceId,
      projectId,
    );

    const items = tasks.map((task) => this.toListItem(task));

    return {
      items,
      total: items.length,
    };
  }

  private toListItem(task: TaskEntity): ProjectTaskListItemResult {
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

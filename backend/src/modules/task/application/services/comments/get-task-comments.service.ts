import { Inject, Injectable } from '@nestjs/common';

import { TaskPermissionService } from '../permissions/task-permission.service';

import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type {
  TaskCommentDetails,
  TaskRepositoryPort,
} from '../../../domain/ports/task.repository.port';

import {
  TaskAccessDeniedError,
  TaskNotFoundError,
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type TaskCommentListItemResult = TaskCommentDetails;

export type GetTaskCommentsInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  userId: string;
};

export type GetTaskCommentsResult = {
  items: TaskCommentListItemResult[];
  total: number;
};

@Injectable()
export class GetTaskCommentsService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
    private readonly taskPermissionService: TaskPermissionService,
  ) {}

  async execute(input: GetTaskCommentsInput): Promise<GetTaskCommentsResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const userId = UserId.create(input.userId);

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

    const canViewTaskComments =
      await this.taskPermissionService.canViewTaskComments({
        workspaceId,
        projectId,
        userId,
      });

    if (!canViewTaskComments) {
      throw new TaskAccessDeniedError();
    }

    const task = await this.taskRepository.findByProjectAndId(
      workspaceId,
      projectId,
      taskId,
    );

    if (!task) {
      throw new TaskNotFoundError();
    }

    const comments = await this.taskRepository.findTaskCommentsByTaskId(taskId);

    return {
      items: comments,
      total: comments.length,
    };
  }
}

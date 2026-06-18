import { Inject, Injectable } from '@nestjs/common';

import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type {
  TaskCommentDetails,
  TaskRepositoryPort,
} from '../../../domain/ports/task.repository.port';

import {
  TaskNotFoundError,
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type TaskCommentListItemResult = TaskCommentDetails;

export type GetTaskCommentsInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
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
  ) { }

  async execute(input: GetTaskCommentsInput): Promise<GetTaskCommentsResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
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

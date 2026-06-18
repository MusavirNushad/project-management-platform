import { Inject, Injectable } from '@nestjs/common';


import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../../domain/ports/task.repository.port';

import {
  TaskCommentHasRepliesError,
  TaskCommentNotFoundError,
  TaskCommentTaskMismatchError,
  TaskNotFoundError,
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskCommentId } from '../../../domain/value-objects/task-comment-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type DeleteTaskCommentInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  commentId: string;
};

export type DeleteTaskCommentResult = {
  message: string;
};

@Injectable()
export class DeleteTaskCommentService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
  ) { }

  async execute(
    input: DeleteTaskCommentInput,
  ): Promise<DeleteTaskCommentResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const commentId = TaskCommentId.create(input.commentId);

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

    const comment = await this.taskRepository.findTaskCommentById(commentId);

    if (!comment) {
      throw new TaskCommentNotFoundError();
    }

    if (comment.taskId !== taskId.value) {
      throw new TaskCommentTaskMismatchError();
    }



    const hasCommentReplies =
      await this.taskRepository.hasCommentReplies(commentId);

    if (hasCommentReplies) {
      throw new TaskCommentHasRepliesError();
    }

    await this.taskRepository.deleteTaskCommentById(commentId);

    return {
      message: 'Task comment deleted successfully.',
    };
  }
}

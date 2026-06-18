import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';


import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type {
  TaskCommentDetails,
  TaskRepositoryPort,
} from '../../../domain/ports/task.repository.port';

import { TaskCommentEntity } from '../../../domain/entities/task-comment.entity';

import {
  TaskCommentTaskMismatchError,
  TaskNotFoundError,
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskCommentBody } from '../../../domain/value-objects/task-comment-body.vo';
import { TaskCommentId } from '../../../domain/value-objects/task-comment-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type CreateTaskCommentInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  authorId: string;
  body: string;
  parentCommentId?: string | null;
};

export type CreateTaskCommentResult = TaskCommentDetails;

@Injectable()
export class CreateTaskCommentService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
  ) { }

  async execute(
    input: CreateTaskCommentInput,
  ): Promise<CreateTaskCommentResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const authorId = UserId.create(input.authorId);

    const body = TaskCommentBody.create(input.body);

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


    const parentCommentId = input.parentCommentId
      ? TaskCommentId.create(input.parentCommentId)
      : null;

    if (parentCommentId) {
      const parentComment =
        await this.taskRepository.findTaskCommentById(parentCommentId);

      if (!parentComment || parentComment.taskId !== taskId.value) {
        throw new TaskCommentTaskMismatchError();
      }
    }

    const comment = TaskCommentEntity.create({
      id: TaskCommentId.create(randomUUID()),
      taskId,
      authorId,
      parentCommentId,
      body,
      attachments: [],
    });

    return this.taskRepository.saveTaskComment(comment);
  }
}

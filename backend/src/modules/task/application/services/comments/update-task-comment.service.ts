import { Inject, Injectable } from '@nestjs/common';

import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type {
    TaskCommentDetails,
    TaskRepositoryPort,
} from '../../../domain/ports/task.repository.port';

import { TaskCommentEntity } from '../../../domain/entities/task-comment.entity';

import {
    TaskCommentAccessDeniedError,
    TaskCommentNotFoundError,
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

export type UpdateTaskCommentInput = {
    workspaceId: string;
    projectId: string;
    taskId: string;
    commentId: string;
    userId: string;
    body: string;
};

export type UpdateTaskCommentResult = TaskCommentDetails;

@Injectable()
export class UpdateTaskCommentService {
    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: TaskRepositoryPort,
    ) { }

    async execute(
        input: UpdateTaskCommentInput,
    ): Promise<UpdateTaskCommentResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const taskId = TaskId.create(input.taskId);
        const commentId = TaskCommentId.create(input.commentId);
        const userId = UserId.create(input.userId);

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

        const existingComment =
            await this.taskRepository.findTaskCommentById(commentId);

        if (!existingComment) {
            throw new TaskCommentNotFoundError();
        }

        if (existingComment.taskId !== taskId.value) {
            throw new TaskCommentTaskMismatchError();
        }

        if (existingComment.authorId !== userId.value) {
            throw new TaskCommentAccessDeniedError();
        }

        const comment = TaskCommentEntity.restore({
            id: TaskCommentId.create(existingComment.id),
            taskId: TaskId.create(existingComment.taskId),
            authorId: UserId.create(existingComment.authorId),
            parentCommentId: existingComment.parentCommentId
                ? TaskCommentId.create(existingComment.parentCommentId)
                : null,
            body: TaskCommentBody.create(existingComment.body),
            attachments: existingComment.attachments,
            createdAt: existingComment.createdAt,
            updatedAt: existingComment.updatedAt,
        });

        comment.updateBody(body);

        return this.taskRepository.updateTaskComment(comment);
    }
}

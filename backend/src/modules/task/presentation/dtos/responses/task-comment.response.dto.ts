import type { CreateTaskCommentResult } from '../../../application/services/comments/create-task-comment.service';
import type { UpdateTaskCommentResult } from '../../../application/services/comments/update-task-comment.service';

type TaskCommentServiceResult =
    | CreateTaskCommentResult
    | UpdateTaskCommentResult;

export class TaskCommentAuthorResponseDto {
    id!: string;
    name!: string;
    email!: string;
}

export class TaskCommentResponseDto {
    id!: string;
    taskId!: string;
    authorId!: string;
    parentCommentId!: string | null;
    body!: string;
    attachments!: unknown[];
    author!: TaskCommentAuthorResponseDto;
    createdAt!: Date;
    updatedAt!: Date;

    static fromResult(result: TaskCommentServiceResult): TaskCommentResponseDto {
        return {
            id: result.id,
            taskId: result.taskId,
            authorId: result.authorId,
            parentCommentId: result.parentCommentId,
            body: result.body,
            attachments: result.attachments,
            author: {
                id: result.author.id,
                name: result.author.name,
                email: result.author.email,
            },
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
    }
}

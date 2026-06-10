import type {
  GetTaskCommentsResult,
  TaskCommentListItemResult,
} from '../../../application/services/comments/get-task-comments.service';

export class TaskCommentListAuthorResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

export class TaskCommentListItemResponseDto {
  id!: string;
  taskId!: string;
  authorId!: string;
  parentCommentId!: string | null;
  body!: string;
  attachments!: unknown[];
  author!: TaskCommentListAuthorResponseDto;
  createdAt!: Date;
  updatedAt!: Date;

  static fromResult(
    result: TaskCommentListItemResult,
  ): TaskCommentListItemResponseDto {
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

export class TaskCommentListResponseDto {
  items!: TaskCommentListItemResponseDto[];
  total!: number;

  static fromResult(result: GetTaskCommentsResult): TaskCommentListResponseDto {
    return {
      items: result.items.map(TaskCommentListItemResponseDto.fromResult),
      total: result.total,
    };
  }
}

import { Comment as PrismaComment, Prisma } from '@prisma/client';

import { TaskCommentEntity } from '../../domain/entities/task-comment.entity';

import { TaskCommentBody } from '../../domain/value-objects/task-comment-body.vo';
import { TaskCommentId } from '../../domain/value-objects/task-comment-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

export class TaskCommentMapper {
  static toDomain(comment: PrismaComment): TaskCommentEntity {
    return TaskCommentEntity.restore({
      id: TaskCommentId.create(comment.id),
      taskId: TaskId.create(comment.taskId),
      authorId: UserId.create(comment.authorId),
      parentCommentId: comment.parentCommentId
        ? TaskCommentId.create(comment.parentCommentId)
        : null,
      body: TaskCommentBody.create(comment.body),
      attachments: this.toUnknownArray(comment.attachments),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  }

  static toPrismaCreate(
    comment: TaskCommentEntity,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      id: comment.getId(),
      taskId: comment.getTaskId(),
      authorId: comment.getAuthorId(),
      parentCommentId: comment.getParentCommentId(),
      body: comment.getBody(),
      attachments: comment.getAttachments() as Prisma.InputJsonValue,
      createdAt: comment.getCreatedAt(),
      updatedAt: comment.getUpdatedAt(),
    };
  }

  static toPrismaUpdate(
    comment: TaskCommentEntity,
  ): Prisma.CommentUncheckedUpdateInput {
    return {
      body: comment.getBody(),
      attachments: comment.getAttachments() as Prisma.InputJsonValue,
      updatedAt: comment.getUpdatedAt(),
    };
  }

  private static toUnknownArray(value: Prisma.JsonValue): unknown[] {
    return Array.isArray(value) ? value : [];
  }
}

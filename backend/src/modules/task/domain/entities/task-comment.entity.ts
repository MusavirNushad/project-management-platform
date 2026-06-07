import { TaskCommentBody } from '../value-objects/task-comment-body.vo';
import { TaskCommentId } from '../value-objects/task-comment-id.vo';
import { TaskId } from '../value-objects/task-id.vo';
import { UserId } from '../value-objects/user-id.vo';

type TaskCommentEntityProps = {
    id: TaskCommentId;
    taskId: TaskId;
    authorId: UserId;
    parentCommentId: TaskCommentId | null;
    body: TaskCommentBody;
    attachments: unknown[];
    createdAt: Date;
    updatedAt: Date;
};

type CreateTaskCommentProps = {
    id: TaskCommentId;
    taskId: TaskId;
    authorId: UserId;
    parentCommentId?: TaskCommentId | null;
    body: TaskCommentBody;
    attachments?: unknown[];
    createdAt?: Date;
    updatedAt?: Date;
};

type RestoreTaskCommentProps = {
    id: TaskCommentId;
    taskId: TaskId;
    authorId: UserId;
    parentCommentId: TaskCommentId | null;
    body: TaskCommentBody;
    attachments: unknown[];
    createdAt: Date;
    updatedAt: Date;
};

export class TaskCommentEntity {
    private constructor(private readonly props: TaskCommentEntityProps) { }

    static create(props: CreateTaskCommentProps): TaskCommentEntity {
        const now = new Date();

        return new TaskCommentEntity({
            id: props.id,
            taskId: props.taskId,
            authorId: props.authorId,
            parentCommentId: props.parentCommentId ?? null,
            body: props.body,
            attachments: props.attachments ?? [],
            createdAt: props.createdAt ?? now,
            updatedAt: props.updatedAt ?? now,
        });
    }

    static restore(props: RestoreTaskCommentProps): TaskCommentEntity {
        return new TaskCommentEntity({
            id: props.id,
            taskId: props.taskId,
            authorId: props.authorId,
            parentCommentId: props.parentCommentId,
            body: props.body,
            attachments: props.attachments,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        });
    }

    updateBody(body: TaskCommentBody): void {
        this.props.body = body;
        this.touch();
    }

    belongsToTask(taskId: TaskId): boolean {
        return this.props.taskId.equals(taskId);
    }

    isWrittenBy(userId: UserId): boolean {
        return this.props.authorId.equals(userId);
    }

    getId(): string {
        return this.props.id.value;
    }

    getTaskId(): string {
        return this.props.taskId.value;
    }

    getAuthorId(): string {
        return this.props.authorId.value;
    }

    getParentCommentId(): string | null {
        return this.props.parentCommentId?.value ?? null;
    }

    getBody(): string {
        return this.props.body.value;
    }

    getAttachments(): unknown[] {
        return [...this.props.attachments];
    }

    getCreatedAt(): Date {
        return this.props.createdAt;
    }

    getUpdatedAt(): Date {
        return this.props.updatedAt;
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }
}
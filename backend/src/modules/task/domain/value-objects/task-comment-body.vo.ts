import { InvalidTaskCommentBodyError } from '../errors/task-domain.errors';

export class TaskCommentBody {
  private constructor(private readonly props: { value: string }) {}

  static create(value: string): TaskCommentBody {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new InvalidTaskCommentBodyError('comment body is required');
    }

    if (normalizedValue.length > 2000) {
      throw new InvalidTaskCommentBodyError(
        'comment body must be at most 2000 characters',
      );
    }

    return new TaskCommentBody({ value: normalizedValue });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other: TaskCommentBody): boolean {
    return this.value === other.value;
  }
}

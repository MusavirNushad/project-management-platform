import { InvalidTaskCommentIdError } from '../errors/task-domain.errors';

export class TaskCommentId {
  private constructor(private readonly props: { value: string }) {}

  static create(value: string): TaskCommentId {
    const normalizedValue = value.trim();

    if (!this.isValidUuid(normalizedValue)) {
      throw new InvalidTaskCommentIdError();
    }

    return new TaskCommentId({ value: normalizedValue });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other: TaskCommentId): boolean {
    return this.value === other.value;
  }

  private static isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(value);
  }
}

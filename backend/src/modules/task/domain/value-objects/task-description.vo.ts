import { InvalidTaskDescriptionError } from '../errors/task-domain.errors';

export class TaskDescription {
  private constructor(private readonly props: { value: string | null }) {}

  static create(value?: string | null): TaskDescription {
    if (value === undefined || value === null) {
      return new TaskDescription({ value: null });
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return new TaskDescription({ value: null });
    }

    if (normalizedValue.length > 2000) {
      throw new InvalidTaskDescriptionError(
        'description must be at most 2000 characters',
      );
    }

    return new TaskDescription({ value: normalizedValue });
  }

  get value(): string | null {
    return this.props.value;
  }

  equals(other: TaskDescription): boolean {
    return this.value === other.value;
  }
}

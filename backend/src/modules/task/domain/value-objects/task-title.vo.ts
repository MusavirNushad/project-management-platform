import { InvalidTaskTitleError } from '../errors/task-domain.errors';

export class TaskTitle {
    private constructor(private readonly props: { value: string }) { }

    static create(value: string): TaskTitle {
        const normalizedValue = value.trim().replace(/\s+/g, ' ');

        if (!normalizedValue) {
            throw new InvalidTaskTitleError('title is required');
        }

        if (normalizedValue.length < 2) {
            throw new InvalidTaskTitleError('title must be at least 2 characters');
        }

        if (normalizedValue.length > 150) {
            throw new InvalidTaskTitleError('title must be at most 150 characters');
        }

        return new TaskTitle({ value: normalizedValue });
    }

    get value(): string {
        return this.props.value;
    }

    equals(other: TaskTitle): boolean {
        return this.value === other.value;
    }
}
import { InvalidProjectTitleError } from '../errors/project-domain.errors';

export class ProjectTitle {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 150;

    private constructor(private readonly props: { value: string }) { }

    static create(value: string): ProjectTitle {
        const normalizedValue = value.trim().replace(/\s+/g, ' ');

        if (normalizedValue.length < this.MIN_LENGTH) {
            throw new InvalidProjectTitleError(
                `title must be at least ${this.MIN_LENGTH} characters long`,
            );
        }

        if (normalizedValue.length > this.MAX_LENGTH) {
            throw new InvalidProjectTitleError(
                `title must not exceed ${this.MAX_LENGTH} characters`,
            );
        }

        return new ProjectTitle({ value: normalizedValue });
    }

    get value(): string {
        return this.props.value;
    }

    equals(other: ProjectTitle): boolean {
        return this.value === other.value;
    }
}
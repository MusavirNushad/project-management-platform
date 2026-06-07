import { InvalidProjectDescriptionError } from '../errors/project-domain.errors';

export class ProjectDescription {
    private static readonly MAX_LENGTH = 1000;

    private constructor(private readonly props: { value: string | null }) { }

    static create(value?: string | null): ProjectDescription {
        if (value === undefined || value === null) {
            return new ProjectDescription({ value: null });
        }

        const normalizedValue = value.trim();

        if (normalizedValue.length === 0) {
            return new ProjectDescription({ value: null });
        }

        if (normalizedValue.length > this.MAX_LENGTH) {
            throw new InvalidProjectDescriptionError(
                `description must not exceed ${this.MAX_LENGTH} characters`,
            );
        }

        return new ProjectDescription({ value: normalizedValue });
    }

    get value(): string | null {
        return this.props.value;
    }

    equals(other: ProjectDescription): boolean {
        return this.value === other.value;
    }
}
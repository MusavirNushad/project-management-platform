
import { InvalidWorkspaceNameError } from '../errors/workspace-domain.errors';

export class WorkspaceName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 100;

    private constructor(private readonly props: { value: string }) { }

    static create(value: string): WorkspaceName {
        const normalizedValue = value.trim().replace(/\s+/g, ' ');

        if (normalizedValue.length < this.MIN_LENGTH) {
            throw new InvalidWorkspaceNameError(
                `name must be at least ${this.MIN_LENGTH} characters long`,
            );
        }

        if (normalizedValue.length > this.MAX_LENGTH) {
            throw new InvalidWorkspaceNameError(
                `name must not exceed ${this.MAX_LENGTH} characters`,
            );
        }

        return new WorkspaceName({ value: normalizedValue });
    }

    get value(): string {
        return this.props.value;
    }

    equals(other: WorkspaceName): boolean {
        return this.value === other.value;
    }
}
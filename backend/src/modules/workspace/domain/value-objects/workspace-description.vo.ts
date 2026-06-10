import { InvalidWorkspaceDescriptionError } from '../errors/workspace-domain.errors';

export class WorkspaceDescription {
  private static readonly MAX_LENGTH = 600;

  private constructor(private readonly props: { value: string | null }) {}

  static create(value?: string | null): WorkspaceDescription {
    if (value === undefined || value === null) {
      return new WorkspaceDescription({ value: null });
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return new WorkspaceDescription({ value: null });
    }

    if (normalizedValue.length > this.MAX_LENGTH) {
      throw new InvalidWorkspaceDescriptionError(
        `description must not exceed ${this.MAX_LENGTH} characters`,
      );
    }

    return new WorkspaceDescription({ value: normalizedValue });
  }

  get value(): string | null {
    return this.props.value;
  }

  equals(other: WorkspaceDescription): boolean {
    return this.value === other.value;
  }
}

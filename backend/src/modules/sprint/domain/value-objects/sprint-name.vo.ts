import { InvalidSprintNameError } from '../errors/sprint-domain.errors';

export class SprintName {
  private constructor(private readonly props: { value: string }) {}

  static create(value: string): SprintName {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (!normalizedValue) {
      throw new InvalidSprintNameError('sprint name is required');
    }

    if (normalizedValue.length < 2) {
      throw new InvalidSprintNameError(
        'sprint name must be at least 2 characters',
      );
    }

    if (normalizedValue.length > 150) {
      throw new InvalidSprintNameError(
        'sprint name must be at most 150 characters',
      );
    }

    return new SprintName({ value: normalizedValue });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other: SprintName): boolean {
    return this.value === other.value;
  }
}

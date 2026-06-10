import { InvalidSprintGoalError } from '../errors/sprint-domain.errors';

export class SprintGoal {
  private constructor(private readonly props: { value: string | null }) {}

  static create(value?: string | null): SprintGoal {
    if (value === undefined || value === null) {
      return new SprintGoal({ value: null });
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return new SprintGoal({ value: null });
    }

    if (normalizedValue.length > 1000) {
      throw new InvalidSprintGoalError(
        'sprint goal must be at most 1000 characters',
      );
    }

    return new SprintGoal({ value: normalizedValue });
  }

  get value(): string | null {
    return this.props.value;
  }

  equals(other: SprintGoal): boolean {
    return this.value === other.value;
  }
}

import { InvalidSprintIdError } from '../errors/sprint-domain.errors';

export class SprintId {
  private constructor(private readonly props: { value: string }) {}

  static create(value: string): SprintId {
    const normalizedValue = value.trim();

    if (!this.isValidUuid(normalizedValue)) {
      throw new InvalidSprintIdError();
    }

    return new SprintId({ value: normalizedValue });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other: SprintId): boolean {
    return this.value === other.value;
  }

  private static isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(value);
  }
}

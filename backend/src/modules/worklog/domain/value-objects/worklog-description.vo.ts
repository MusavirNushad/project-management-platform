import { InvalidWorklogDescriptionError } from '../errors/worklog-domain.errors';

export class WorklogDescription {
  private constructor(private readonly props: { value: string | null }) {}

  static create(value?: string | null): WorklogDescription {
    if (value === undefined || value === null) {
      return new WorklogDescription({ value: null });
    }

    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (normalizedValue.length === 0) {
      return new WorklogDescription({ value: null });
    }

    if (normalizedValue.length > 1500) {
      throw new InvalidWorklogDescriptionError();
    }

    return new WorklogDescription({ value: normalizedValue });
  }

  get value(): string | null {
    return this.props.value;
  }
}

import { InvalidUserProfileIdError } from '../errors/identity-domain.errors';

export class UserProfileId {
  private constructor(private readonly props: { value: string }) {}

  static create(value: string): UserProfileId {
    const normalizedValue = value.trim();

    if (!this.isValidUuid(normalizedValue)) {
      throw new InvalidUserProfileIdError(value);
    }

    return new UserProfileId({ value: normalizedValue });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other: UserProfileId): boolean {
    return this.value === other.value;
  }

  private static isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(value);
  }
}

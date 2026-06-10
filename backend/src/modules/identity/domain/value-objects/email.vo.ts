// src/modules/identity/domain/value-objects/email.vo.ts

import { InvalidEmailError } from '../errors/identity-domain.errors';

export class Email {
  private constructor(private readonly props: { value: string }) {}

  static create(value: string): Email {
    const normalizedValue = value.trim().toLowerCase();

    if (!this.isValidEmail(normalizedValue)) {
      throw new InvalidEmailError(value);
    }

    return new Email({ value: normalizedValue });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private static isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  }
}

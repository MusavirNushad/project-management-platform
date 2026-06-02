// src/modules/identity/domain/value-objects/password.vo.ts

import { InvalidPasswordError, InvalidPasswordHashError } from '../errors/identity-domain.errors';


export class Password {
    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 72;

    private constructor(private readonly props: { value: string }) { }

    static create(value: string): Password {
        if (!value || value.trim().length === 0) {
            throw new InvalidPasswordError('password is required');
        }

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidPasswordError(
                `password must be at least ${this.MIN_LENGTH} characters long`,
            );
        }

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidPasswordError(
                `password must not exceed ${this.MAX_LENGTH} characters`,
            );
        }

        return new Password({ value });
    }

    get value(): string {
        return this.props.value;
    }
}

export class PasswordHash {
    private constructor(private readonly props: { value: string }) { }

    static create(value: string): PasswordHash {
        const normalizedValue = value.trim();

        if (!normalizedValue) {
            throw new InvalidPasswordHashError();
        }

        return new PasswordHash({ value: normalizedValue });
    }

    get value(): string {
        return this.props.value;
    }

    equals(other: PasswordHash): boolean {
        return this.value === other.value;
    }
}
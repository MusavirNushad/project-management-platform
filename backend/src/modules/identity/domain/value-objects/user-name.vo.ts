// src/modules/identity/domain/value-objects/user-name.vo.ts

import { InvalidUserNameError } from '../errors/identity-domain.errors';

export class UserName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 80;

    private constructor(private readonly props: { value: string }) { }

    static create(value: string): UserName {
        const normalizedValue = value.trim().replace(/\s+/g, ' ');

        if (normalizedValue.length < this.MIN_LENGTH) {
            throw new InvalidUserNameError(
                `name must be at least ${this.MIN_LENGTH} characters long`,
            );
        }

        if (normalizedValue.length > this.MAX_LENGTH) {
            throw new InvalidUserNameError(
                `name must not exceed ${this.MAX_LENGTH} characters`,
            );
        }

        return new UserName({ value: normalizedValue });
    }

    get value(): string {
        return this.props.value;
    }

    equals(other: UserName): boolean {
        return this.value === other.value;
    }
}
import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

import { PASSWORD_HASHER } from '../../ports/password-hasher.port';
import type { PasswordHasherPort } from '../../ports/password-hasher.port';

import {
    InvalidCredentialsError,
    UserNotFoundError,
} from '../../../domain/errors/identity-domain.errors';

import {
    Password,
    PasswordHash,
} from '../../../domain/value-objects/password.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

export type ChangePasswordInput = {
    userId: string;
    currentPassword: string;
    newPassword: string;
};

export type ChangePasswordResult = {
    message: string;
};

@Injectable()
export class ChangePasswordService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepositoryPort,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasherPort,
    ) { }

    async execute(input: ChangePasswordInput): Promise<ChangePasswordResult> {
        const userId = UserId.create(input.userId);

        const currentPassword = this.createPasswordOrFail(input.currentPassword);
        const newPassword = Password.create(input.newPassword);

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        const currentPasswordHash = PasswordHash.create(user.getPasswordHash());

        const isCurrentPasswordValid = await this.passwordHasher.compare(
            currentPassword,
            currentPasswordHash,
        );

        if (!isCurrentPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const newPasswordHash = await this.passwordHasher.hash(newPassword);

        user.changePasswordHash(newPasswordHash);

        await this.userRepository.save(user);

        return {
            message: 'Password changed successfully.',
        };
    }

    private createPasswordOrFail(password: string): Password {
        try {
            return Password.create(password);
        } catch {
            throw new InvalidCredentialsError();
        }
    }
}
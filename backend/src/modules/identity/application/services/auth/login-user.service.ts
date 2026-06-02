// src/modules/identity/application/services/auth/login-user.service.ts

import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

import { PASSWORD_HASHER } from '../../ports/password-hasher.port';
import type { PasswordHasherPort } from '../../ports/password-hasher.port';

import { TOKEN_SERVICE } from '../../ports/token-service.port';
import type {
    AuthTokens,
    TokenServicePort,
} from '../../ports/token-service.port';

import { InvalidCredentialsError } from '../../../domain/errors/identity-domain.errors';
import { Email } from '../../../domain/value-objects/email.vo';
import {
    Password,
    PasswordHash,
} from '../../../domain/value-objects/password.vo';

export type LoginUserInput = {
    email: string;
    password: string;
};

export type LoginUserResult = {
    tokens: AuthTokens;
    user: {
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
};

@Injectable()
export class LoginUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepositoryPort,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasherPort,

        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
    ) { }

    async execute(input: LoginUserInput): Promise<LoginUserResult> {
        const email = Email.create(input.email);

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const password = this.createPassword(input.password);
        const passwordHash = PasswordHash.create(user.getPasswordHash());

        const isPasswordValid = await this.passwordHasher.compare(
            password,
            passwordHash,
        );

        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const tokens = await this.tokenService.generateAuthTokens({
            userId: user.getId(),
            email: user.getEmail(),
        });

        return {
            tokens,
            user: {
                id: user.getId(),
                name: user.getName(),
                email: user.getEmail(),
                isVerified: user.getIsVerified(),
                createdAt: user.getCreatedAt(),
                updatedAt: user.getUpdatedAt(),
            },
        };
    }

    private createPassword(password: string): Password {
        try {
            return Password.create(password);
        } catch {
            throw new InvalidCredentialsError();
        }
    }
}
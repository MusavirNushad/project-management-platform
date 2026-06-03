import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

import { PASSWORD_HASHER } from '../../ports/password-hasher.port';
import type { PasswordHasherPort } from '../../ports/password-hasher.port';

import { TOKEN_SERVICE } from '../../ports/token-service.port';
import type {
    AuthTokens,
    TokenServicePort,
} from '../../ports/token-service.port';

import { UserEntity } from '../../../domain/entities/user.entity';
import { UserAlreadyExistsError } from '../../../domain/errors/identity-domain.errors';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserName } from '../../../domain/value-objects/user-name.vo';

export type RegisterUserInput = {
    name: string;
    email: string;
    password: string;
};

export type RegisterUserResult = {
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
export class RegisterUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepositoryPort,

        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasherPort,

        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
    ) { }

    async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
        const email = Email.create(input.email);
        const name = UserName.create(input.name);
        const password = Password.create(input.password);

        const userAlreadyExists = await this.userRepository.existsByEmail(email);

        if (userAlreadyExists) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await this.passwordHasher.hash(password);

        const user = UserEntity.create({
            id: UserId.create(randomUUID()),
            name,
            email,
            passwordHash,
        });

        const savedUser = await this.userRepository.save(user);

        const tokens = await this.tokenService.generateAuthTokens({
            userId: savedUser.getId(),
            email: savedUser.getEmail(),
        });

        return {
            tokens,
            user: {
                id: savedUser.getId(),
                name: savedUser.getName(),
                email: savedUser.getEmail(),
                isVerified: savedUser.getIsVerified(),
                createdAt: savedUser.getCreatedAt(),
                updatedAt: savedUser.getUpdatedAt(),
            },
        };
    }
}
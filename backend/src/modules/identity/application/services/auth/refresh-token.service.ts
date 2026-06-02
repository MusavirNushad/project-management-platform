import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

import { TOKEN_SERVICE } from '../../ports/token-service.port';
import type {
    AuthTokenPayload,
    AuthTokens,
    TokenServicePort,
} from '../../ports/token-service.port';

import { InvalidRefreshTokenError } from '../../../domain/errors/identity-domain.errors';
import { UserId } from '../../../domain/value-objects/user-id.vo';

export type RefreshTokenInput = {
    refreshToken: string;
};

export type RefreshTokenResult = {
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
export class RefreshTokenService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepositoryPort,

        @Inject(TOKEN_SERVICE)
        private readonly tokenService: TokenServicePort,
    ) { }

    async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
        const payload = await this.verifyRefreshToken(input.refreshToken);

        const user = await this.userRepository.findById(
            UserId.create(payload.userId),
        );

        if (!user) {
            throw new InvalidRefreshTokenError();
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

    private async verifyRefreshToken(
        refreshToken: string,
    ): Promise<AuthTokenPayload> {
        try {
            return await this.tokenService.verifyRefreshToken(refreshToken);
        } catch {
            throw new InvalidRefreshTokenError();
        }
    }
}

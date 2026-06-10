import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  AuthTokenPayload,
  AuthTokens,
  GenerateAuthTokensInput,
  TokenServicePort,
} from '../../application/ports/token-service.port';

const AccessTokenType = 'access' as const;
const RefreshTokenType = 'refresh' as const;

const JWT_ACCESS_SECRET = 'JWT_ACCESS_SECRET';
const JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET';
const JWT_ACCESS_EXPIRES_IN = 'JWT_ACCESS_EXPIRES_IN';
const JWT_REFRESH_EXPIRES_IN = 'JWT_REFRESH_EXPIRES_IN';

type JwtTokenType = typeof AccessTokenType | typeof RefreshTokenType;

type InternalJwtPayload = {
  sub: string;
  email: string;
  tokenType: JwtTokenType;
};

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAuthTokens(
    input: GenerateAuthTokensInput,
  ): Promise<AuthTokens> {
    const accessPayload: InternalJwtPayload = {
      sub: input.userId,
      email: input.email,
      tokenType: AccessTokenType,
    };

    const refreshPayload: InternalJwtPayload = {
      sub: input.userId,
      email: input.email,
      tokenType: RefreshTokenType,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.getRequiredConfig(JWT_ACCESS_SECRET),
        expiresIn: this.getRequiredJwtExpiresIn(JWT_ACCESS_EXPIRES_IN),
      }),

      this.jwtService.signAsync(refreshPayload, {
        secret: this.getRequiredConfig(JWT_REFRESH_SECRET),
        expiresIn: this.getRequiredJwtExpiresIn(JWT_REFRESH_EXPIRES_IN),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<AuthTokenPayload> {
    const payload = await this.jwtService.verifyAsync<InternalJwtPayload>(
      token,
      {
        secret: this.getRequiredConfig(JWT_ACCESS_SECRET),
      },
    );

    return this.toAuthTokenPayload(payload, AccessTokenType);
  }

  async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    const payload = await this.jwtService.verifyAsync<InternalJwtPayload>(
      token,
      {
        secret: this.getRequiredConfig(JWT_REFRESH_SECRET),
      },
    );

    return this.toAuthTokenPayload(payload, RefreshTokenType);
  }

  private toAuthTokenPayload(
    payload: InternalJwtPayload,
    expectedTokenType: JwtTokenType,
  ): AuthTokenPayload {
    if (!payload.sub || !payload.email) {
      throw new Error('Invalid token payload.');
    }

    if (payload.tokenType !== expectedTokenType) {
      throw new Error('Invalid token type.');
    }

    return {
      userId: payload.sub,
      email: payload.email,
    };
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} is not configured.`);
    }

    return value;
  }

  private getRequiredJwtExpiresIn(key: string): JwtSignOptions['expiresIn'] {
    return this.getRequiredConfig(key) as JwtSignOptions['expiresIn'];
  }
}

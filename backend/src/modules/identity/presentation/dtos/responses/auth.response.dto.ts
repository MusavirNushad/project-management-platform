import type { LoginUserResult } from '../../../application/services/auth/login-user.service';
import type { RegisterUserResult } from '../../../application/services/auth/register-user.service';
import type { RefreshTokenResult } from '../../../application/services/auth/refresh-token.service';
type AuthServiceResult =
  | RegisterUserResult
  | LoginUserResult
  | RefreshTokenResult;

export class AuthUserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  isVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class AuthTokensResponseDto {
  accessToken!: string;
  refreshToken!: string;
}

export class AuthResponseDto {
  tokens!: AuthTokensResponseDto;
  user!: AuthUserResponseDto;

  static fromResult(result: AuthServiceResult): AuthResponseDto {
    return {
      tokens: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        isVerified: result.user.isVerified,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
    };
  }
}

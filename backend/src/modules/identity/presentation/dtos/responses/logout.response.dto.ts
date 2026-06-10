import type { LogoutUserResult } from '../../../application/services/auth/logout-user.service';

export class LogoutResponseDto {
  message!: string;

  static fromResult(result: LogoutUserResult): LogoutResponseDto {
    return {
      message: result.message,
    };
  }
}

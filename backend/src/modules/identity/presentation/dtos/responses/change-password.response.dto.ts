import type { ChangePasswordResult } from '../../../application/services/users/change-password.service';

export class ChangePasswordResponseDto {
    message!: string;

    static fromResult(result: ChangePasswordResult): ChangePasswordResponseDto {
        return {
            message: result.message,
        };
    }
}

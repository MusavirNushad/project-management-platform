import type { DeleteWorklogResult } from '../../../application/services/worklogs/delete-worklog.service';

export class DeleteWorklogResponseDto {
    message!: string;

    static fromResult(
        result: DeleteWorklogResult,
    ): DeleteWorklogResponseDto {
        return {
            message: result.message,
        };
    }
}
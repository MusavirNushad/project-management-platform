import type { DeleteTaskCommentResult } from '../../../application/services/comments/delete-task-comment.service';

export class DeleteTaskCommentResponseDto {
    message!: string;

    static fromResult(
        result: DeleteTaskCommentResult,
    ): DeleteTaskCommentResponseDto {
        return {
            message: result.message,
        };
    }
}

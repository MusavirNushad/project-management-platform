import type { RemoveTaskAssigneeResult } from '../../../application/services/assignees/remove-task-assignee.service';

export class RemoveTaskAssigneeResponseDto {
  message!: string;

  static fromResult(
    result: RemoveTaskAssigneeResult,
  ): RemoveTaskAssigneeResponseDto {
    return {
      message: result.message,
    };
  }
}

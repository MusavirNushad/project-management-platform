import type { RemoveTaskFromSprintResult } from '../../../application/services/tasks/remove-task-from-sprint.service';

export class RemoveTaskFromSprintResponseDto {
  message!: string;

  static fromResult(
    result: RemoveTaskFromSprintResult,
  ): RemoveTaskFromSprintResponseDto {
    return {
      message: result.message,
    };
  }
}

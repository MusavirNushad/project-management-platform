import type { RemoveProjectMemberResult } from '../../../application/services/members/remove-project-member.service';

export class RemoveProjectMemberResponseDto {
  message!: string;

  static fromResult(
    result: RemoveProjectMemberResult,
  ): RemoveProjectMemberResponseDto {
    return {
      message: result.message,
    };
  }
}

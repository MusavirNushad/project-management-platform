import type { RemoveWorkspaceMemberResult } from '../../../application/services/members/remove-workspace-member.service';

export class RemoveWorkspaceMemberResponseDto {
  message!: string;

  static fromResult(
    result: RemoveWorkspaceMemberResult,
  ): RemoveWorkspaceMemberResponseDto {
    return {
      message: result.message,
    };
  }
}

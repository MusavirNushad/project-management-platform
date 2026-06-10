import type {
  GetWorkspaceMembersResult,
  WorkspaceMemberListItemResult,
} from '../../../application/services/members/get-workspace-members.service';

export class WorkspaceMemberUserResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

export class WorkspaceMemberRoleResponseDto {
  id!: string;
  name!: string;
}

export class WorkspaceMemberListItemResponseDto {
  id!: string;
  workspaceId!: string;
  userId!: string;
  user!: WorkspaceMemberUserResponseDto;
  role!: WorkspaceMemberRoleResponseDto;
  joinedAt!: Date;

  static fromResult(
    result: WorkspaceMemberListItemResult,
  ): WorkspaceMemberListItemResponseDto {
    return {
      id: result.id,
      workspaceId: result.workspaceId,
      userId: result.userId,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      role: {
        id: result.role.id,
        name: result.role.name,
      },
      joinedAt: result.joinedAt,
    };
  }
}

export class WorkspaceMemberListResponseDto {
  items!: WorkspaceMemberListItemResponseDto[];
  total!: number;

  static fromResult(
    result: GetWorkspaceMembersResult,
  ): WorkspaceMemberListResponseDto {
    return {
      items: result.items.map(WorkspaceMemberListItemResponseDto.fromResult),
      total: result.total,
    };
  }
}

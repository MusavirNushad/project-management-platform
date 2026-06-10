import {
  Prisma,
  WorkspaceMember as PrismaWorkspaceMember,
} from '@prisma/client';

import { WorkspaceMemberEntity } from '../../domain/entities/workspace-member.entity';
import { RoleId } from '../../domain/value-objects/role-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';
import { WorkspaceMemberId } from '../../domain/value-objects/workspace-member-id.vo';

export class WorkspaceMemberMapper {
  static toDomain(member: PrismaWorkspaceMember): WorkspaceMemberEntity {
    return WorkspaceMemberEntity.restore({
      id: WorkspaceMemberId.create(member.id),
      workspaceId: WorkspaceId.create(member.workspaceId),
      userId: UserId.create(member.userId),
      roleId: RoleId.create(member.roleId),
      joinedAt: member.joinedAt,
    });
  }

  static toPrismaCreate(
    member: WorkspaceMemberEntity,
  ): Prisma.WorkspaceMemberUncheckedCreateInput {
    return {
      id: member.getId(),
      workspaceId: member.getWorkspaceId(),
      userId: member.getUserId(),
      roleId: member.getRoleId(),
      joinedAt: member.getJoinedAt(),
    };
  }

  static toPrismaUpdate(
    member: WorkspaceMemberEntity,
  ): Prisma.WorkspaceMemberUncheckedUpdateInput {
    return {
      roleId: member.getRoleId(),
    };
  }
}

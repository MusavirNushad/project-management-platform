// src/modules/workspace/domain/ports/workspace.repository.port.ts

import { WorkspaceEntity } from '../entities/workspace.entity';
import { RoleId } from '../value-objects/role-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';
import { WorkspaceSlug } from '../value-objects/workspace-slug.vo';
import { WorkspaceMemberId } from '../value-objects/workspace-member-id.vo';

export const WORKSPACE_REPOSITORY = Symbol('WORKSPACE_REPOSITORY');

export type WorkspaceRoleName = 'OWNER' | 'ADMIN' | 'MEMBER';

export type WorkspaceMemberDetails = {
  id: string;
  workspaceId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
  };
  joinedAt: Date;
};

export type WorkspaceAssignableRoleName = 'ADMIN' | 'MEMBER';

export type WorkspaceUserDetails = {
  id: string;
  name: string;
  email: string;
};

export interface WorkspaceRepositoryPort {
  save(workspace: WorkspaceEntity): Promise<WorkspaceEntity>;

  findById(id: WorkspaceId): Promise<WorkspaceEntity | null>;

  findBySlug(slug: WorkspaceSlug): Promise<WorkspaceEntity | null>;

  existsBySlug(slug: WorkspaceSlug): Promise<boolean>;

  findByMemberUserId(userId: UserId): Promise<WorkspaceEntity[]>;

  isUserMember(workspaceId: WorkspaceId, userId: UserId): Promise<boolean>;

  findRoleIdByName(roleName: WorkspaceRoleName): Promise<RoleId | null>;

  findMembersByWorkspaceId(
    workspaceId: WorkspaceId,
  ): Promise<WorkspaceMemberDetails[]>;

  findUserByEmail(email: string): Promise<WorkspaceUserDetails | null>;

  findMemberDetailsByWorkspaceAndUser(
    workspaceId: WorkspaceId,
    userId: UserId,
  ): Promise<WorkspaceMemberDetails | null>;

  findMemberDetailsById(
    memberId: WorkspaceMemberId,
  ): Promise<WorkspaceMemberDetails | null>;

  deleteMemberById(memberId: WorkspaceMemberId): Promise<void>;
}

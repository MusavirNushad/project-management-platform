import { RoleId } from '../value-objects/role-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';
import { WorkspaceMemberId } from '../value-objects/workspace-member-id.vo';

type WorkspaceMemberEntityProps = {
  id: WorkspaceMemberId;
  workspaceId: WorkspaceId;
  userId: UserId;
  roleId: RoleId;
  joinedAt: Date;
};

type CreateWorkspaceMemberProps = {
  id: WorkspaceMemberId;
  workspaceId: WorkspaceId;
  userId: UserId;
  roleId: RoleId;
  joinedAt?: Date;
};

type RestoreWorkspaceMemberProps = {
  id: WorkspaceMemberId;
  workspaceId: WorkspaceId;
  userId: UserId;
  roleId: RoleId;
  joinedAt: Date;
};

export class WorkspaceMemberEntity {
  private constructor(private readonly props: WorkspaceMemberEntityProps) {}

  static create(props: CreateWorkspaceMemberProps): WorkspaceMemberEntity {
    return new WorkspaceMemberEntity({
      id: props.id,
      workspaceId: props.workspaceId,
      userId: props.userId,
      roleId: props.roleId,
      joinedAt: props.joinedAt ?? new Date(),
    });
  }

  static restore(props: RestoreWorkspaceMemberProps): WorkspaceMemberEntity {
    return new WorkspaceMemberEntity({
      id: props.id,
      workspaceId: props.workspaceId,
      userId: props.userId,
      roleId: props.roleId,
      joinedAt: props.joinedAt,
    });
  }

  belongsToUser(userId: UserId): boolean {
    return this.props.userId.equals(userId);
  }

  belongsToWorkspace(workspaceId: WorkspaceId): boolean {
    return this.props.workspaceId.equals(workspaceId);
  }

  getId(): string {
    return this.props.id.value;
  }

  getWorkspaceId(): string {
    return this.props.workspaceId.value;
  }

  getUserId(): string {
    return this.props.userId.value;
  }

  getUserIdValueObject(): UserId {
    return this.props.userId;
  }

  getRoleId(): string {
    return this.props.roleId.value;
  }

  getJoinedAt(): Date {
    return this.props.joinedAt;
  }
}

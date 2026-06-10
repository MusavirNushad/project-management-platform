import { WorkspaceMemberEntity } from './workspace-member.entity';

import { RoleId } from '../value-objects/role-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceDescription } from '../value-objects/workspace-description.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';
import { WorkspaceMemberId } from '../value-objects/workspace-member-id.vo';
import { WorkspaceName } from '../value-objects/workspace-name.vo';
import { WorkspaceSlug } from '../value-objects/workspace-slug.vo';

import {
  WorkspaceMemberAlreadyExistsError,
  WorkspaceMemberWorkspaceMismatchError,
} from '../errors/workspace-domain.errors';
type WorkspaceEntityProps = {
  id: WorkspaceId;
  ownerId: UserId;
  name: WorkspaceName;
  slug: WorkspaceSlug;
  description: WorkspaceDescription;
  members: WorkspaceMemberEntity[];
  createdAt: Date;
  updatedAt: Date;
};

type CreateWorkspaceProps = {
  id: WorkspaceId;
  ownerId: UserId;
  name: WorkspaceName;
  slug: WorkspaceSlug;
  description: WorkspaceDescription;
  ownerMemberId: WorkspaceMemberId;
  ownerRoleId: RoleId;
  createdAt?: Date;
  updatedAt?: Date;
};

type RestoreWorkspaceProps = {
  id: WorkspaceId;
  ownerId: UserId;
  name: WorkspaceName;
  slug: WorkspaceSlug;
  description: WorkspaceDescription;
  members: WorkspaceMemberEntity[];
  createdAt: Date;
  updatedAt: Date;
};

type UpdateWorkspaceDetailsProps = {
  name?: WorkspaceName;
  slug?: WorkspaceSlug;
  description?: WorkspaceDescription;
};

export class WorkspaceEntity {
  private constructor(private readonly props: WorkspaceEntityProps) {}

  static create(props: CreateWorkspaceProps): WorkspaceEntity {
    const now = new Date();

    const createdAt = props.createdAt ?? now;
    const updatedAt = props.updatedAt ?? now;

    const ownerMember = WorkspaceMemberEntity.create({
      id: props.ownerMemberId,
      workspaceId: props.id,
      userId: props.ownerId,
      roleId: props.ownerRoleId,
      joinedAt: createdAt,
    });

    return new WorkspaceEntity({
      id: props.id,
      ownerId: props.ownerId,
      name: props.name,
      slug: props.slug,
      description: props.description,
      members: [ownerMember],
      createdAt,
      updatedAt,
    });
  }

  static restore(props: RestoreWorkspaceProps): WorkspaceEntity {
    return new WorkspaceEntity({
      id: props.id,
      ownerId: props.ownerId,
      name: props.name,
      slug: props.slug,
      description: props.description,
      members: props.members,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  updateDetails(props: UpdateWorkspaceDetailsProps): void {
    if (props.name) {
      this.props.name = props.name;
    }

    if (props.slug) {
      this.props.slug = props.slug;
    }

    if (props.description) {
      this.props.description = props.description;
    }

    this.touch();
  }

  addMember(member: WorkspaceMemberEntity): void {
    if (!member.belongsToWorkspace(this.props.id)) {
      throw new WorkspaceMemberWorkspaceMismatchError();
    }

    if (this.hasMember(member.getUserIdValueObject())) {
      throw new WorkspaceMemberAlreadyExistsError();
    }

    this.props.members.push(member);
    this.touch();
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.ownerId.equals(userId);
  }

  hasMember(userId: UserId): boolean {
    return this.props.members.some((member) => member.belongsToUser(userId));
  }

  getId(): string {
    return this.props.id.value;
  }

  getOwnerId(): string {
    return this.props.ownerId.value;
  }

  getName(): string {
    return this.props.name.value;
  }

  getSlug(): string {
    return this.props.slug.value;
  }

  getDescription(): string | null {
    return this.props.description.value;
  }

  getMembers(): WorkspaceMemberEntity[] {
    return [...this.props.members];
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}

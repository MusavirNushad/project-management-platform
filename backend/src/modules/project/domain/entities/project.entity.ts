// src/modules/project/domain/entities/project.entity.ts

import { ProjectMemberEntity } from './project-member.entity';

import {
  InvalidProjectDateRangeError,
  InvalidProjectStatusError,
  ProjectMemberAlreadyExistsError,
  ProjectMemberProjectMismatchError,
} from '../errors/project-domain.errors';

import { ProjectDescription } from '../value-objects/project-description.vo';
import { ProjectId } from '../value-objects/project-id.vo';
import { ProjectMemberId } from '../value-objects/project-member-id.vo';
import { ProjectTitle } from '../value-objects/project-title.vo';
import { RoleId } from '../value-objects/role-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';

const ProjectStatuses: ProjectStatus[] = [
  'ACTIVE',
  'COMPLETED',
  'ARCHIVED',
  'CANCELLED',
];

type ProjectEntityProps = {
  id: ProjectId;
  workspaceId: WorkspaceId;
  createdBy: UserId;
  title: ProjectTitle;
  status: ProjectStatus;
  description: ProjectDescription;
  startDate: Date | null;
  dueDate: Date | null;
  members: ProjectMemberEntity[];
  createdAt: Date;
  updatedAt: Date;
};

type CreateProjectProps = {
  id: ProjectId;
  workspaceId: WorkspaceId;
  createdBy: UserId;
  title: ProjectTitle;
  description: ProjectDescription;
  creatorMemberId: ProjectMemberId;
  creatorRoleId: RoleId;
  startDate?: Date | null;
  dueDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type RestoreProjectProps = {
  id: ProjectId;
  workspaceId: WorkspaceId;
  createdBy: UserId;
  title: ProjectTitle;
  status: ProjectStatus;
  description: ProjectDescription;
  startDate: Date | null;
  dueDate: Date | null;
  members: ProjectMemberEntity[];
  createdAt: Date;
  updatedAt: Date;
};

type UpdateProjectDetailsProps = {
  title?: ProjectTitle;
  description?: ProjectDescription;
  startDate?: Date | null;
  dueDate?: Date | null;
};

export class ProjectEntity {
  private constructor(private readonly props: ProjectEntityProps) {}

  static create(props: CreateProjectProps): ProjectEntity {
    const now = new Date();

    const createdAt = props.createdAt ?? now;
    const updatedAt = props.updatedAt ?? now;

    const startDate = props.startDate ?? null;
    const dueDate = props.dueDate ?? null;

    this.validateDateRange(startDate, dueDate);

    const creatorMember = ProjectMemberEntity.create({
      id: props.creatorMemberId,
      projectId: props.id,
      userId: props.createdBy,
      roleId: props.creatorRoleId,
      joinedAt: createdAt,
    });

    return new ProjectEntity({
      id: props.id,
      workspaceId: props.workspaceId,
      createdBy: props.createdBy,
      title: props.title,
      status: 'ACTIVE',
      description: props.description,
      startDate,
      dueDate,
      members: [creatorMember],
      createdAt,
      updatedAt,
    });
  }

  static restore(props: RestoreProjectProps): ProjectEntity {
    this.validateStatus(props.status);
    this.validateDateRange(props.startDate, props.dueDate);

    return new ProjectEntity({
      id: props.id,
      workspaceId: props.workspaceId,
      createdBy: props.createdBy,
      title: props.title,
      status: props.status,
      description: props.description,
      startDate: props.startDate,
      dueDate: props.dueDate,
      members: props.members,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  updateDetails(props: UpdateProjectDetailsProps): void {
    const nextStartDate =
      props.startDate !== undefined ? props.startDate : this.props.startDate;

    const nextDueDate =
      props.dueDate !== undefined ? props.dueDate : this.props.dueDate;

    ProjectEntity.validateDateRange(nextStartDate, nextDueDate);

    if (props.title) {
      this.props.title = props.title;
    }

    if (props.description !== undefined) {
      this.props.description = props.description;
    }

    if (props.startDate !== undefined) {
      this.props.startDate = props.startDate;
    }

    if (props.dueDate !== undefined) {
      this.props.dueDate = props.dueDate;
    }

    this.touch();
  }

  changeStatus(status: ProjectStatus): void {
    ProjectEntity.validateStatus(status);

    this.props.status = status;
    this.touch();
  }

  addMember(member: ProjectMemberEntity): void {
    if (!member.belongsToProject(this.props.id)) {
      throw new ProjectMemberProjectMismatchError();
    }

    if (this.hasMember(member.getUserIdValueObject())) {
      throw new ProjectMemberAlreadyExistsError();
    }

    this.props.members.push(member);
    this.touch();
  }

  belongsToWorkspace(workspaceId: WorkspaceId): boolean {
    return this.props.workspaceId.equals(workspaceId);
  }

  isCreatedBy(userId: UserId): boolean {
    return this.props.createdBy.equals(userId);
  }

  hasMember(userId: UserId): boolean {
    return this.props.members.some((member) => member.belongsToUser(userId));
  }

  getId(): string {
    return this.props.id.value;
  }

  getWorkspaceId(): string {
    return this.props.workspaceId.value;
  }

  getCreatedBy(): string {
    return this.props.createdBy.value;
  }

  getTitle(): string {
    return this.props.title.value;
  }

  getStatus(): ProjectStatus {
    return this.props.status;
  }

  getDescription(): string | null {
    return this.props.description.value;
  }

  getStartDate(): Date | null {
    return this.props.startDate;
  }

  getDueDate(): Date | null {
    return this.props.dueDate;
  }

  getMembers(): ProjectMemberEntity[] {
    return [...this.props.members];
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  private static validateDateRange(
    startDate: Date | null,
    dueDate: Date | null,
  ): void {
    if (startDate && dueDate && startDate > dueDate) {
      throw new InvalidProjectDateRangeError();
    }
  }

  private static validateStatus(status: ProjectStatus): void {
    if (!ProjectStatuses.includes(status)) {
      throw new InvalidProjectStatusError();
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}

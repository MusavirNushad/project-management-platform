import { ProjectEntity } from '../entities/project.entity';

import { ProjectId } from '../value-objects/project-id.vo';
import { ProjectMemberId } from '../value-objects/project-member-id.vo';
import { RoleId } from '../value-objects/role-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export type ProjectAssignableRoleName = 'ADMIN' | 'MEMBER';

export type ProjectRoleName = 'OWNER' | ProjectAssignableRoleName;

export type ProjectMemberDetails = {
  id: string;
  projectId: string;
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

export type ProjectUserDetails = {
  id: string;
  name: string;
  email: string;
};

export interface ProjectRepositoryPort {
  save(project: ProjectEntity): Promise<ProjectEntity>;

  findById(projectId: ProjectId): Promise<ProjectEntity | null>;

  findByWorkspaceAndId(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<ProjectEntity | null>;

  findByWorkspaceId(workspaceId: WorkspaceId): Promise<ProjectEntity[]>;

  workspaceExists(workspaceId: WorkspaceId): Promise<boolean>;

  isWorkspaceMember(workspaceId: WorkspaceId, userId: UserId): Promise<boolean>;

  isWorkspaceOwner(workspaceId: WorkspaceId, userId: UserId): Promise<boolean>;

  findRoleIdByName(roleName: ProjectRoleName): Promise<RoleId | null>;

  findProjectMembersByProjectId(
    projectId: ProjectId,
  ): Promise<ProjectMemberDetails[]>;

  findUserByEmail(email: string): Promise<ProjectUserDetails | null>;

  findProjectMemberDetailsByProjectAndUser(
    projectId: ProjectId,
    userId: UserId,
  ): Promise<ProjectMemberDetails | null>;

  findProjectMemberDetailsById(
    memberId: ProjectMemberId,
  ): Promise<ProjectMemberDetails | null>;

  updateProjectMemberRoleById(
    memberId: ProjectMemberId,
    roleId: RoleId,
  ): Promise<ProjectMemberDetails>;

  deleteProjectMemberById(memberId: ProjectMemberId): Promise<void>;
}

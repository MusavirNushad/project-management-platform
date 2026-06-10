import { WorklogEntity } from '../entities/worklog.entity';

import { ProjectId } from '../value-objects/project-id.vo';
import { TaskId } from '../value-objects/task-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorklogId } from '../value-objects/worklog-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';

export const WORKLOG_REPOSITORY = Symbol('WORKLOG_REPOSITORY');

export type ProjectMemberRoleName = 'OWNER' | 'ADMIN' | 'MEMBER';

export type ProjectMemberDetailsForWorklog = {
  id: string;
  projectId: string;
  userId: string;
  role: {
    id: string;
    name: ProjectMemberRoleName;
  };
};

export type WorklogUserDetails = {
  id: string;
  name: string;
  email: string;
};

export type WorklogTaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'CANCELLED';

export type WorklogTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type WorklogTaskDetails = {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  status: WorklogTaskStatus;
  priority: WorklogTaskPriority;
};

export type WorklogDetails = {
  id: string;
  userId: string;
  projectId: string;
  taskId: string;
  startedAt: Date;
  endedAt: Date | null;
  durationMin: number | null;
  description: string | null;
  createdAt: Date;
  user: WorklogUserDetails;
};

export interface WorklogRepositoryPort {
  save(worklog: WorklogEntity): Promise<WorklogDetails>;

  findById(worklogId: WorklogId): Promise<WorklogDetails | null>;

  findByTaskId(taskId: TaskId): Promise<WorklogDetails[]>;

  update(worklog: WorklogEntity): Promise<WorklogDetails>;

  deleteById(worklogId: WorklogId): Promise<void>;

  workspaceExists(workspaceId: WorkspaceId): Promise<boolean>;

  projectExistsInWorkspace(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<boolean>;

  findTaskByProjectAndId(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    taskId: TaskId,
  ): Promise<WorklogTaskDetails | null>;

  isWorkspaceOwner(workspaceId: WorkspaceId, userId: UserId): Promise<boolean>;

  isProjectMember(projectId: ProjectId, userId: UserId): Promise<boolean>;

  findProjectMemberByProjectAndUser(
    projectId: ProjectId,
    userId: UserId,
  ): Promise<ProjectMemberDetailsForWorklog | null>;
}

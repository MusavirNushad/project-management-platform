import { TaskAssigneeEntity } from '../entities/task-assignee.entity';
import { TaskCommentEntity } from '../entities/task-comment.entity';
import { TaskEntity } from '../entities/task.entity';

import { ProjectId } from '../value-objects/project-id.vo';
import { TaskAssigneeId } from '../value-objects/task-assignee-id.vo';
import { TaskCommentId } from '../value-objects/task-comment-id.vo';
import { TaskId } from '../value-objects/task-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export type TaskUserDetails = {
  id: string;
  name: string;
  email: string;
};

export type TaskAssigneeDetails = {
  id: string;
  taskId: string;
  userId: string;
  assignedBy: string;
  workspaceId: string;
  projectId: string;
  user: TaskUserDetails;
  assignedByUser: TaskUserDetails;
  assignedAt: Date;
};

export type TaskCommentDetails = {
  id: string;
  taskId: string;
  authorId: string;
  parentCommentId: string | null;
  body: string;
  attachments: unknown[];
  author: TaskUserDetails;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectMemberRoleName = 'OWNER' | 'ADMIN' | 'MEMBER';

export type ProjectMemberDetailsForTask = {
  id: string;
  projectId: string;
  userId: string;
  role: {
    id: string;
    name: ProjectMemberRoleName;
  };
};

export interface TaskRepositoryPort {
  save(task: TaskEntity): Promise<TaskEntity>;

  findById(taskId: TaskId): Promise<TaskEntity | null>;

  findByProjectAndId(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    taskId: TaskId,
  ): Promise<TaskEntity | null>;

  findByProjectId(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<TaskEntity[]>;

  workspaceExists(workspaceId: WorkspaceId): Promise<boolean>;

  projectExistsInWorkspace(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<boolean>;

  isWorkspaceOwner(workspaceId: WorkspaceId, userId: UserId): Promise<boolean>;

  isProjectMember(projectId: ProjectId, userId: UserId): Promise<boolean>;

  findProjectMemberByProjectAndUser(
    projectId: ProjectId,
    userId: UserId,
  ): Promise<ProjectMemberDetailsForTask | null>;

  findUserById(userId: UserId): Promise<TaskUserDetails | null>;

  saveTaskAssignee(
    taskAssignee: TaskAssigneeEntity,
  ): Promise<TaskAssigneeDetails>;

  findTaskAssigneesByTaskId(taskId: TaskId): Promise<TaskAssigneeDetails[]>;

  findTaskAssigneeById(
    assigneeId: TaskAssigneeId,
  ): Promise<TaskAssigneeDetails | null>;

  findTaskAssigneeByTaskAndUser(
    taskId: TaskId,
    userId: UserId,
  ): Promise<TaskAssigneeDetails | null>;

  deleteTaskAssigneeById(assigneeId: TaskAssigneeId): Promise<void>;

  saveTaskComment(comment: TaskCommentEntity): Promise<TaskCommentDetails>;

  findTaskCommentsByTaskId(taskId: TaskId): Promise<TaskCommentDetails[]>;

  findTaskCommentById(
    commentId: TaskCommentId,
  ): Promise<TaskCommentDetails | null>;

  updateTaskComment(comment: TaskCommentEntity): Promise<TaskCommentDetails>;

  hasCommentReplies(commentId: TaskCommentId): Promise<boolean>;

  deleteTaskCommentById(commentId: TaskCommentId): Promise<void>;
  canUserAccessTask(taskId: TaskId, userId: UserId): Promise<boolean>;
}

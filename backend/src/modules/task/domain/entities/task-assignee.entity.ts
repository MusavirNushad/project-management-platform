import { ProjectId } from '../value-objects/project-id.vo';
import { TaskAssigneeId } from '../value-objects/task-assignee-id.vo';
import { TaskId } from '../value-objects/task-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';

type TaskAssigneeEntityProps = {
  id: TaskAssigneeId;
  taskId: TaskId;
  userId: UserId;
  assignedBy: UserId;
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  assignedAt: Date;
};

type CreateTaskAssigneeProps = {
  id: TaskAssigneeId;
  taskId: TaskId;
  userId: UserId;
  assignedBy: UserId;
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  assignedAt?: Date;
};

type RestoreTaskAssigneeProps = {
  id: TaskAssigneeId;
  taskId: TaskId;
  userId: UserId;
  assignedBy: UserId;
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  assignedAt: Date;
};

export class TaskAssigneeEntity {
  private constructor(private readonly props: TaskAssigneeEntityProps) {}

  static create(props: CreateTaskAssigneeProps): TaskAssigneeEntity {
    return new TaskAssigneeEntity({
      id: props.id,
      taskId: props.taskId,
      userId: props.userId,
      assignedBy: props.assignedBy,
      workspaceId: props.workspaceId,
      projectId: props.projectId,
      assignedAt: props.assignedAt ?? new Date(),
    });
  }

  static restore(props: RestoreTaskAssigneeProps): TaskAssigneeEntity {
    return new TaskAssigneeEntity({
      id: props.id,
      taskId: props.taskId,
      userId: props.userId,
      assignedBy: props.assignedBy,
      workspaceId: props.workspaceId,
      projectId: props.projectId,
      assignedAt: props.assignedAt,
    });
  }

  belongsToTask(taskId: TaskId): boolean {
    return this.props.taskId.equals(taskId);
  }

  belongsToUser(userId: UserId): boolean {
    return this.props.userId.equals(userId);
  }

  getId(): string {
    return this.props.id.value;
  }

  getTaskId(): string {
    return this.props.taskId.value;
  }

  getUserId(): string {
    return this.props.userId.value;
  }

  getAssignedBy(): string {
    return this.props.assignedBy.value;
  }

  getWorkspaceId(): string {
    return this.props.workspaceId.value;
  }

  getProjectId(): string {
    return this.props.projectId.value;
  }

  getAssignedAt(): Date {
    return this.props.assignedAt;
  }
}

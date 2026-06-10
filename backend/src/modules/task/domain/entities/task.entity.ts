import {
  InvalidTaskDateRangeError,
  InvalidTaskPriorityError,
  InvalidTaskStatusError,
  TaskAssigneeAlreadyExistsError,
  TaskAssigneeTaskMismatchError,
} from '../errors/task-domain.errors';

import { ProjectId } from '../value-objects/project-id.vo';
import { TaskAssigneeId } from '../value-objects/task-assignee-id.vo';
import { TaskDescription } from '../value-objects/task-description.vo';
import { TaskId } from '../value-objects/task-id.vo';
import { TaskTitle } from '../value-objects/task-title.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';

import { TaskAssigneeEntity } from './task-assignee.entity';

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

const TaskStatuses: TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'CANCELLED',
];

const TaskPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

type TaskEntityProps = {
  id: TaskId;
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  reporterId: UserId;
  assigneeId: UserId | null;
  title: TaskTitle;
  description: TaskDescription;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  isCompleted: boolean;
  attachments: unknown[];
  assignees: TaskAssigneeEntity[];
  createdAt: Date;
  updatedAt: Date;
};

type CreateTaskProps = {
  id: TaskId;
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  reporterId: UserId;
  title: TaskTitle;
  description: TaskDescription;
  priority?: TaskPriority;
  startDate?: Date | null;
  dueDate?: Date | null;
  attachments?: unknown[];
  createdAt?: Date;
  updatedAt?: Date;
};

type RestoreTaskProps = {
  id: TaskId;
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  reporterId: UserId;
  assigneeId: UserId | null;
  title: TaskTitle;
  description: TaskDescription;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  isCompleted: boolean;
  attachments: unknown[];
  assignees: TaskAssigneeEntity[];
  createdAt: Date;
  updatedAt: Date;
};

type UpdateTaskDetailsProps = {
  title?: TaskTitle;
  description?: TaskDescription;
  priority?: TaskPriority;
  startDate?: Date | null;
  dueDate?: Date | null;
};

export class TaskEntity {
  private constructor(private readonly props: TaskEntityProps) {}

  static create(props: CreateTaskProps): TaskEntity {
    const now = new Date();

    const startDate = props.startDate ?? null;
    const dueDate = props.dueDate ?? null;
    const priority = props.priority ?? 'MEDIUM';

    this.validateDateRange(startDate, dueDate);
    this.validatePriority(priority);

    return new TaskEntity({
      id: props.id,
      workspaceId: props.workspaceId,
      projectId: props.projectId,
      reporterId: props.reporterId,
      assigneeId: null,
      title: props.title,
      description: props.description,
      status: 'TODO',
      priority,
      startDate,
      dueDate,
      completedAt: null,
      isCompleted: false,
      attachments: props.attachments ?? [],
      assignees: [],
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  static restore(props: RestoreTaskProps): TaskEntity {
    this.validateStatus(props.status);
    this.validatePriority(props.priority);
    this.validateDateRange(props.startDate, props.dueDate);

    return new TaskEntity({
      id: props.id,
      workspaceId: props.workspaceId,
      projectId: props.projectId,
      reporterId: props.reporterId,
      assigneeId: props.assigneeId,
      title: props.title,
      description: props.description,
      status: props.status,
      priority: props.priority,
      startDate: props.startDate,
      dueDate: props.dueDate,
      completedAt: props.completedAt,
      isCompleted: props.isCompleted,
      attachments: props.attachments,
      assignees: props.assignees,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  updateDetails(props: UpdateTaskDetailsProps): void {
    const nextStartDate =
      props.startDate !== undefined ? props.startDate : this.props.startDate;

    const nextDueDate =
      props.dueDate !== undefined ? props.dueDate : this.props.dueDate;

    TaskEntity.validateDateRange(nextStartDate, nextDueDate);

    if (props.title) this.props.title = props.title;
    if (props.description !== undefined) {
      this.props.description = props.description;
    }
    if (props.priority !== undefined) {
      TaskEntity.validatePriority(props.priority);
      this.props.priority = props.priority;
    }
    if (props.startDate !== undefined) this.props.startDate = props.startDate;
    if (props.dueDate !== undefined) this.props.dueDate = props.dueDate;

    this.touch();
  }

  changeStatus(status: TaskStatus): void {
    TaskEntity.validateStatus(status);

    this.props.status = status;

    if (status === 'DONE') {
      this.props.isCompleted = true;
      this.props.completedAt = new Date();
    }

    if (status !== 'DONE') {
      this.props.isCompleted = false;
      this.props.completedAt = null;
    }

    this.touch();
  }

  addAssignee(assignee: TaskAssigneeEntity): void {
    const taskId = TaskId.create(this.getId());

    if (!assignee.belongsToTask(taskId)) {
      throw new TaskAssigneeTaskMismatchError();
    }

    const userAlreadyAssigned = this.props.assignees.some((existingAssignee) =>
      existingAssignee.belongsToUser(UserId.create(assignee.getUserId())),
    );

    if (userAlreadyAssigned) {
      throw new TaskAssigneeAlreadyExistsError();
    }

    this.props.assignees.push(assignee);
    this.touch();
  }

  belongsToProject(projectId: ProjectId): boolean {
    return this.props.projectId.equals(projectId);
  }

  belongsToWorkspace(workspaceId: WorkspaceId): boolean {
    return this.props.workspaceId.equals(workspaceId);
  }

  isReportedBy(userId: UserId): boolean {
    return this.props.reporterId.equals(userId);
  }

  getId(): string {
    return this.props.id.value;
  }

  getWorkspaceId(): string {
    return this.props.workspaceId.value;
  }

  getProjectId(): string {
    return this.props.projectId.value;
  }

  getReporterId(): string {
    return this.props.reporterId.value;
  }

  getAssigneeId(): string | null {
    return this.props.assigneeId?.value ?? null;
  }

  getTitle(): string {
    return this.props.title.value;
  }

  getDescription(): string | null {
    return this.props.description.value;
  }

  getStatus(): TaskStatus {
    return this.props.status;
  }

  getPriority(): TaskPriority {
    return this.props.priority;
  }

  getStartDate(): Date | null {
    return this.props.startDate;
  }

  getDueDate(): Date | null {
    return this.props.dueDate;
  }

  getCompletedAt(): Date | null {
    return this.props.completedAt;
  }

  getIsCompleted(): boolean {
    return this.props.isCompleted;
  }

  getAttachments(): unknown[] {
    return [...this.props.attachments];
  }

  getAssignees(): TaskAssigneeEntity[] {
    return [...this.props.assignees];
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
      throw new InvalidTaskDateRangeError();
    }
  }

  private static validateStatus(status: TaskStatus): void {
    if (!TaskStatuses.includes(status)) {
      throw new InvalidTaskStatusError();
    }
  }

  private static validatePriority(priority: TaskPriority): void {
    if (!TaskPriorities.includes(priority)) {
      throw new InvalidTaskPriorityError();
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}

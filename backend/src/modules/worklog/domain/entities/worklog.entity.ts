import { InvalidWorklogDateRangeError } from '../errors/worklog-domain.errors';

import { ProjectId } from '../value-objects/project-id.vo';
import { TaskId } from '../value-objects/task-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorklogDescription } from '../value-objects/worklog-description.vo';
import { WorklogId } from '../value-objects/worklog-id.vo';

type WorklogEntityProps = {
  id: WorklogId;
  userId: UserId;
  projectId: ProjectId;
  taskId: TaskId;
  startedAt: Date;
  endedAt: Date | null;
  durationMin: number | null;
  description: WorklogDescription;
  createdAt: Date;
};

type CreateWorklogProps = {
  id: WorklogId;
  userId: UserId;
  projectId: ProjectId;
  taskId: TaskId;
  startedAt: Date;
  endedAt?: Date | null;
  description: WorklogDescription;
};

type RestoreWorklogProps = {
  id: WorklogId;
  userId: UserId;
  projectId: ProjectId;
  taskId: TaskId;
  startedAt: Date;
  endedAt: Date | null;
  durationMin: number | null;
  description: WorklogDescription;
  createdAt: Date;
};

type UpdateWorklogDetailsInput = {
  startedAt?: Date;
  endedAt?: Date | null;
  description?: WorklogDescription;
};

export class WorklogEntity {
  private constructor(private readonly props: WorklogEntityProps) {}

  static create(props: CreateWorklogProps): WorklogEntity {
    const endedAt = props.endedAt ?? null;

    return new WorklogEntity({
      id: props.id,
      userId: props.userId,
      projectId: props.projectId,
      taskId: props.taskId,
      startedAt: props.startedAt,
      endedAt,
      durationMin: WorklogEntity.calculateDurationInMinutes(
        props.startedAt,
        endedAt,
      ),
      description: props.description,
      createdAt: new Date(),
    });
  }

  static restore(props: RestoreWorklogProps): WorklogEntity {
    return new WorklogEntity({
      id: props.id,
      userId: props.userId,
      projectId: props.projectId,
      taskId: props.taskId,
      startedAt: props.startedAt,
      endedAt: props.endedAt,
      durationMin: props.durationMin,
      description: props.description,
      createdAt: props.createdAt,
    });
  }

  updateDetails(input: UpdateWorklogDetailsInput): void {
    const startedAt = input.startedAt ?? this.props.startedAt;
    const endedAt =
      input.endedAt !== undefined ? input.endedAt : this.props.endedAt;

    this.props.startedAt = startedAt;
    this.props.endedAt = endedAt;
    this.props.durationMin = WorklogEntity.calculateDurationInMinutes(
      startedAt,
      endedAt,
    );

    if (input.description !== undefined) {
      this.props.description = input.description;
    }
  }

  belongsToTask(taskId: TaskId): boolean {
    return this.props.taskId.equals(taskId);
  }

  belongsToProject(projectId: ProjectId): boolean {
    return this.props.projectId.equals(projectId);
  }

  isCreatedBy(userId: UserId): boolean {
    return this.props.userId.equals(userId);
  }

  getId(): string {
    return this.props.id.value;
  }

  getUserId(): string {
    return this.props.userId.value;
  }

  getProjectId(): string {
    return this.props.projectId.value;
  }

  getTaskId(): string {
    return this.props.taskId.value;
  }

  getStartedAt(): Date {
    return this.props.startedAt;
  }

  getEndedAt(): Date | null {
    return this.props.endedAt;
  }

  getDurationMin(): number | null {
    return this.props.durationMin;
  }

  getDescription(): string | null {
    return this.props.description.value;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  private static calculateDurationInMinutes(
    startedAt: Date,
    endedAt: Date | null,
  ): number | null {
    if (!this.isValidDate(startedAt)) {
      throw new InvalidWorklogDateRangeError();
    }

    if (endedAt === null) {
      return null;
    }

    if (!this.isValidDate(endedAt)) {
      throw new InvalidWorklogDateRangeError();
    }

    const durationInMs = endedAt.getTime() - startedAt.getTime();

    if (durationInMs <= 0) {
      throw new InvalidWorklogDateRangeError();
    }

    return Math.ceil(durationInMs / 60000);
  }

  private static isValidDate(value: Date): boolean {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }
}

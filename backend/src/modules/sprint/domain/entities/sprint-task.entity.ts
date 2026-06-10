import { SprintId } from '../value-objects/sprint-id.vo';
import { SprintTaskId } from '../value-objects/sprint-task-id.vo';
import { TaskId } from '../value-objects/task-id.vo';

type SprintTaskEntityProps = {
  id: SprintTaskId;
  sprintId: SprintId;
  taskId: TaskId;
  position: number | null;
  addedAt: Date;
  removedAt: Date | null;
};

type CreateSprintTaskProps = {
  id: SprintTaskId;
  sprintId: SprintId;
  taskId: TaskId;
  position?: number | null;
  addedAt?: Date;
  removedAt?: Date | null;
};

type RestoreSprintTaskProps = {
  id: SprintTaskId;
  sprintId: SprintId;
  taskId: TaskId;
  position: number | null;
  addedAt: Date;
  removedAt: Date | null;
};

export class SprintTaskEntity {
  private constructor(private readonly props: SprintTaskEntityProps) {}

  static create(props: CreateSprintTaskProps): SprintTaskEntity {
    return new SprintTaskEntity({
      id: props.id,
      sprintId: props.sprintId,
      taskId: props.taskId,
      position: props.position ?? null,
      addedAt: props.addedAt ?? new Date(),
      removedAt: props.removedAt ?? null,
    });
  }

  static restore(props: RestoreSprintTaskProps): SprintTaskEntity {
    return new SprintTaskEntity({
      id: props.id,
      sprintId: props.sprintId,
      taskId: props.taskId,
      position: props.position,
      addedAt: props.addedAt,
      removedAt: props.removedAt,
    });
  }

  markRemoved(): void {
    this.props.removedAt = new Date();
  }

  belongsToSprint(sprintId: SprintId): boolean {
    return this.props.sprintId.equals(sprintId);
  }

  belongsToTask(taskId: TaskId): boolean {
    return this.props.taskId.equals(taskId);
  }

  isActive(): boolean {
    return this.props.removedAt === null;
  }

  getId(): string {
    return this.props.id.value;
  }

  getSprintId(): string {
    return this.props.sprintId.value;
  }

  getTaskId(): string {
    return this.props.taskId.value;
  }

  getPosition(): number | null {
    return this.props.position;
  }

  getAddedAt(): Date {
    return this.props.addedAt;
  }

  getRemovedAt(): Date | null {
    return this.props.removedAt;
  }
}

import type {
  GetSprintTasksResult,
  SprintTaskListItemResult,
} from '../../../application/services/tasks/get-sprint-tasks.service';

export class SprintTaskListTaskResponseDto {
  id!: string;
  title!: string;
  status!: string;
  priority!: string;
}

export class SprintTaskListItemResponseDto {
  id!: string;
  sprintId!: string;
  taskId!: string;
  position!: number | null;
  addedAt!: Date;
  removedAt!: Date | null;
  task!: SprintTaskListTaskResponseDto;

  static fromResult(
    result: SprintTaskListItemResult,
  ): SprintTaskListItemResponseDto {
    return {
      id: result.id,
      sprintId: result.sprintId,
      taskId: result.taskId,
      position: result.position,
      addedAt: result.addedAt,
      removedAt: result.removedAt,
      task: {
        id: result.task.id,
        title: result.task.title,
        status: result.task.status,
        priority: result.task.priority,
      },
    };
  }
}

export class SprintTaskListResponseDto {
  items!: SprintTaskListItemResponseDto[];
  total!: number;

  static fromResult(result: GetSprintTasksResult): SprintTaskListResponseDto {
    return {
      items: result.items.map((item) =>
        SprintTaskListItemResponseDto.fromResult(item),
      ),
      total: result.total,
    };
  }
}

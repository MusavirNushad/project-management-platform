import type {
  GetTaskWorklogsResult,
  TaskWorklogListItemResult,
} from '../../../application/services/worklogs/get-task-worklogs.service';

export class WorklogListUserResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

export class WorklogListItemResponseDto {
  id!: string;
  userId!: string;
  projectId!: string;
  taskId!: string;
  startedAt!: Date;
  endedAt!: Date | null;
  durationMin!: number | null;
  description!: string | null;
  createdAt!: Date;
  user!: WorklogListUserResponseDto;

  static fromResult(
    result: TaskWorklogListItemResult,
  ): WorklogListItemResponseDto {
    return {
      id: result.id,
      userId: result.userId,
      projectId: result.projectId,
      taskId: result.taskId,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      durationMin: result.durationMin,
      description: result.description,
      createdAt: result.createdAt,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    };
  }
}

export class WorklogListResponseDto {
  items!: WorklogListItemResponseDto[];
  total!: number;

  static fromResult(result: GetTaskWorklogsResult): WorklogListResponseDto {
    return {
      items: result.items.map((item) =>
        WorklogListItemResponseDto.fromResult(item),
      ),
      total: result.total,
    };
  }
}

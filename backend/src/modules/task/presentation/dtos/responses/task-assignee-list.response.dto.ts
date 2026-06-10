import type {
  GetTaskAssigneesResult,
  TaskAssigneeListItemResult,
} from '../../../application/services/assignees/get-task-assignees.service';

export class TaskAssigneeListUserResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

export class TaskAssigneeListItemResponseDto {
  id!: string;
  taskId!: string;
  userId!: string;
  assignedBy!: string;
  workspaceId!: string;
  projectId!: string;
  user!: TaskAssigneeListUserResponseDto;
  assignedByUser!: TaskAssigneeListUserResponseDto;
  assignedAt!: Date;

  static fromResult(
    result: TaskAssigneeListItemResult,
  ): TaskAssigneeListItemResponseDto {
    return {
      id: result.id,
      taskId: result.taskId,
      userId: result.userId,
      assignedBy: result.assignedBy,
      workspaceId: result.workspaceId,
      projectId: result.projectId,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      assignedByUser: {
        id: result.assignedByUser.id,
        name: result.assignedByUser.name,
        email: result.assignedByUser.email,
      },
      assignedAt: result.assignedAt,
    };
  }
}

export class TaskAssigneeListResponseDto {
  items!: TaskAssigneeListItemResponseDto[];
  total!: number;

  static fromResult(
    result: GetTaskAssigneesResult,
  ): TaskAssigneeListResponseDto {
    return {
      items: result.items.map(TaskAssigneeListItemResponseDto.fromResult),
      total: result.total,
    };
  }
}

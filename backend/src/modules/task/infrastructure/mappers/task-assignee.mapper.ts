import { Prisma, TaskAssignee as PrismaTaskAssignee } from '@prisma/client';

import { TaskAssigneeEntity } from '../../domain/entities/task-assignee.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { TaskAssigneeId } from '../../domain/value-objects/task-assignee-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

export class TaskAssigneeMapper {
  static toDomain(assignee: PrismaTaskAssignee): TaskAssigneeEntity {
    return TaskAssigneeEntity.restore({
      id: TaskAssigneeId.create(assignee.id),
      taskId: TaskId.create(assignee.taskId),
      userId: UserId.create(assignee.userId),
      assignedBy: UserId.create(assignee.assignedById),
      workspaceId: WorkspaceId.create(assignee.workspaceId),
      projectId: ProjectId.create(assignee.projectId),
      assignedAt: assignee.assignedAt,
    });
  }

  static toPrismaCreate(
    assignee: TaskAssigneeEntity,
  ): Prisma.TaskAssigneeUncheckedCreateInput {
    return {
      id: assignee.getId(),
      taskId: assignee.getTaskId(),
      userId: assignee.getUserId(),
      assignedById: assignee.getAssignedBy(),
      workspaceId: assignee.getWorkspaceId(),
      projectId: assignee.getProjectId(),
      assignedAt: assignee.getAssignedAt(),
    };
  }
}

import { Prisma, SprintTask as PrismaSprintTask } from '@prisma/client';

import { SprintTaskEntity } from '../../domain/entities/sprint-task.entity';

import { SprintId } from '../../domain/value-objects/sprint-id.vo';
import { SprintTaskId } from '../../domain/value-objects/sprint-task-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';

export class SprintTaskMapper {
    static toDomain(sprintTask: PrismaSprintTask): SprintTaskEntity {
        return SprintTaskEntity.restore({
            id: SprintTaskId.create(sprintTask.id),
            sprintId: SprintId.create(sprintTask.sprintId),
            taskId: TaskId.create(sprintTask.taskId),
            position: sprintTask.position,
            addedAt: sprintTask.addedAt,
            removedAt: sprintTask.removedAt,
        });
    }

    static toPrismaCreate(
        sprintTask: SprintTaskEntity,
    ): Prisma.SprintTaskUncheckedCreateInput {
        return {
            id: sprintTask.getId(),
            sprintId: sprintTask.getSprintId(),
            taskId: sprintTask.getTaskId(),
            position: sprintTask.getPosition(),
            addedAt: sprintTask.getAddedAt(),
            removedAt: sprintTask.getRemovedAt(),
        };
    }

    static toPrismaUpdate(
        sprintTask: SprintTaskEntity,
    ): Prisma.SprintTaskUncheckedUpdateInput {
        return {
            position: sprintTask.getPosition(),
            removedAt: sprintTask.getRemovedAt(),
        };
    }
}

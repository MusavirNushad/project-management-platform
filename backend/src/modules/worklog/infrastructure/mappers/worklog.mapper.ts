import { Prisma, Worklog as PrismaWorklog } from '@prisma/client';

import { WorklogEntity } from '../../domain/entities/worklog.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorklogDescription } from '../../domain/value-objects/worklog-description.vo';
import { WorklogId } from '../../domain/value-objects/worklog-id.vo';

export class WorklogMapper {
    static toDomain(worklog: PrismaWorklog): WorklogEntity {
        return WorklogEntity.restore({
            id: WorklogId.create(worklog.id),
            userId: UserId.create(worklog.userId),
            projectId: ProjectId.create(worklog.projectId),
            taskId: TaskId.create(worklog.taskId),
            startedAt: worklog.startedAt,
            endedAt: worklog.endedAt,
            durationMin: worklog.durationMin,
            description: WorklogDescription.create(worklog.description),
            createdAt: worklog.createdAt,
        });
    }

    static toPrismaCreate(
        worklog: WorklogEntity,
    ): Prisma.WorklogUncheckedCreateInput {
        return {
            id: worklog.getId(),
            userId: worklog.getUserId(),
            projectId: worklog.getProjectId(),
            taskId: worklog.getTaskId(),
            startedAt: worklog.getStartedAt(),
            endedAt: worklog.getEndedAt(),
            durationMin: worklog.getDurationMin(),
            description: worklog.getDescription(),
            createdAt: worklog.getCreatedAt(),
        };
    }

    static toPrismaUpdate(
        worklog: WorklogEntity,
    ): Prisma.WorklogUncheckedUpdateInput {
        return {
            startedAt: worklog.getStartedAt(),
            endedAt: worklog.getEndedAt(),
            durationMin: worklog.getDurationMin(),
            description: worklog.getDescription(),
        };
    }
}
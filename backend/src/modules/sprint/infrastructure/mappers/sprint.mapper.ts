import { Prisma, Sprint as PrismaSprint } from '@prisma/client';

import {
  SprintEntity,
  type SprintStatus,
} from '../../domain/entities/sprint.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { SprintGoal } from '../../domain/value-objects/sprint-goal.vo';
import { SprintId } from '../../domain/value-objects/sprint-id.vo';
import { SprintName } from '../../domain/value-objects/sprint-name.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

export class SprintMapper {
  static toDomain(sprint: PrismaSprint): SprintEntity {
    return SprintEntity.restore({
      id: SprintId.create(sprint.id),
      projectId: ProjectId.create(sprint.projectId),
      createdBy: UserId.create(sprint.createdById),
      name: SprintName.create(sprint.name),
      goal: SprintGoal.create(sprint.goal),
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
    });
  }

  static toPrismaCreate(
    sprint: SprintEntity,
  ): Prisma.SprintUncheckedCreateInput {
    return {
      id: sprint.getId(),
      projectId: sprint.getProjectId(),
      createdById: sprint.getCreatedBy(),
      name: sprint.getName(),
      goal: sprint.getGoal(),
      status: sprint.getStatus(),
      startDate: sprint.getStartDate(),
      endDate: sprint.getEndDate(),
      createdAt: sprint.getCreatedAt(),
      updatedAt: sprint.getUpdatedAt(),
    };
  }

  static toPrismaUpdate(
    sprint: SprintEntity,
  ): Prisma.SprintUncheckedUpdateInput {
    return {
      name: sprint.getName(),
      goal: sprint.getGoal(),
      status: sprint.getStatus(),
      startDate: sprint.getStartDate(),
      endDate: sprint.getEndDate(),
      updatedAt: sprint.getUpdatedAt(),
    };
  }
}

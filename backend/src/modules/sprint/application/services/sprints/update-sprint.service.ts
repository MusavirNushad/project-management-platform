import { Inject, Injectable } from '@nestjs/common';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type { SprintRepositoryPort } from '../../../domain/ports/sprint.repository.port';

import {
  SprintEntity,
  type SprintStatus,
} from '../../../domain/entities/sprint.entity';

import {
  InvalidSprintDateRangeError,
  InvalidSprintStatusError,
  SprintNotFoundError,
  SprintProjectNotFoundError,
  SprintWorkspaceNotFoundError,
} from '../../../domain/errors/sprint-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { SprintGoal } from '../../../domain/value-objects/sprint-goal.vo';
import { SprintId } from '../../../domain/value-objects/sprint-id.vo';
import { SprintName } from '../../../domain/value-objects/sprint-name.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

const SprintStatuses: SprintStatus[] = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
];

export type UpdateSprintInput = {
  workspaceId: string;
  projectId: string;
  sprintId: string;
  name?: string;
  goal?: string | null;
  status?: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
};

export type UpdateSprintResult = {
  id: string;
  projectId: string;
  createdBy: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateSprintService {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepositoryPort,
  ) { }

  async execute(input: UpdateSprintInput): Promise<UpdateSprintResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const sprintId = SprintId.create(input.sprintId);

    const name =
      input.name !== undefined ? SprintName.create(input.name) : undefined;

    const goal =
      input.goal !== undefined ? SprintGoal.create(input.goal) : undefined;

    const status =
      input.status !== undefined ? this.parseStatus(input.status) : undefined;

    const startDate =
      input.startDate !== undefined
        ? this.parseOptionalDate(input.startDate)
        : undefined;

    const endDate =
      input.endDate !== undefined
        ? this.parseOptionalDate(input.endDate)
        : undefined;

    const workspaceExists =
      await this.sprintRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new SprintWorkspaceNotFoundError();
    }

    const projectExists = await this.sprintRepository.projectExistsInWorkspace(
      workspaceId,
      projectId,
    );

    if (!projectExists) {
      throw new SprintProjectNotFoundError();
    }

    const sprint = await this.sprintRepository.findByProjectAndId(
      projectId,
      sprintId,
    );

    if (!sprint) {
      throw new SprintNotFoundError();
    }

    sprint.updateDetails({
      name,
      goal,
      startDate,
      endDate,
    });

    if (status !== undefined) {
      sprint.changeStatus(status);
    }

    const savedSprint = await this.sprintRepository.save(sprint);

    return this.toResult(savedSprint);
  }

  private parseOptionalDate(value?: string | null): Date | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return null;
    }

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      throw new InvalidSprintDateRangeError();
    }

    return date;
  }

  private parseStatus(status: SprintStatus): SprintStatus {
    if (!SprintStatuses.includes(status)) {
      throw new InvalidSprintStatusError();
    }

    return status;
  }

  private toResult(sprint: SprintEntity): UpdateSprintResult {
    return {
      id: sprint.getId(),
      projectId: sprint.getProjectId(),
      createdBy: sprint.getCreatedBy(),
      name: sprint.getName(),
      goal: sprint.getGoal(),
      status: sprint.getStatus(),
      startDate: sprint.getStartDate(),
      endDate: sprint.getEndDate(),
      createdAt: sprint.getCreatedAt(),
      updatedAt: sprint.getUpdatedAt(),
    };
  }
}

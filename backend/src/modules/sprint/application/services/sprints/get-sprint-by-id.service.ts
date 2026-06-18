import { Inject, Injectable } from '@nestjs/common';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type { SprintRepositoryPort } from '../../../domain/ports/sprint.repository.port';

import { type SprintStatus } from '../../../domain/entities/sprint.entity';

import {
  SprintNotFoundError,
  SprintProjectNotFoundError,
  SprintWorkspaceNotFoundError,
} from '../../../domain/errors/sprint-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { SprintId } from '../../../domain/value-objects/sprint-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type GetSprintByIdInput = {
  workspaceId: string;
  projectId: string;
  sprintId: string;
};

export type GetSprintByIdResult = {
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
export class GetSprintByIdService {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepositoryPort,
  ) { }

  async execute(input: GetSprintByIdInput): Promise<GetSprintByIdResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const sprintId = SprintId.create(input.sprintId);

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


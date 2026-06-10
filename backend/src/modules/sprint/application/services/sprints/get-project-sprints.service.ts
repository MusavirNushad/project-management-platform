import { Inject, Injectable } from '@nestjs/common';

import { SprintPermissionService } from '../permissions/sprint-permission.service';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type { SprintRepositoryPort } from '../../../domain/ports/sprint.repository.port';

import {
  SprintEntity,
  type SprintStatus,
} from '../../../domain/entities/sprint.entity';

import {
  SprintProjectAccessDeniedError,
  SprintProjectNotFoundError,
  SprintWorkspaceNotFoundError,
} from '../../../domain/errors/sprint-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type ProjectSprintListItemResult = {
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

export type GetProjectSprintsInput = {
  workspaceId: string;
  projectId: string;
  userId: string;
};

export type GetProjectSprintsResult = {
  items: ProjectSprintListItemResult[];
  total: number;
};

@Injectable()
export class GetProjectSprintsService {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepositoryPort,
    private readonly sprintPermissionService: SprintPermissionService,
  ) {}

  async execute(
    input: GetProjectSprintsInput,
  ): Promise<GetProjectSprintsResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const userId = UserId.create(input.userId);

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

    const canViewSprints = await this.sprintPermissionService.canViewSprints({
      workspaceId,
      projectId,
      userId,
    });

    if (!canViewSprints) {
      throw new SprintProjectAccessDeniedError();
    }

    const sprints = await this.sprintRepository.findByProjectId(projectId);

    return {
      items: sprints.map((sprint) => this.toResult(sprint)),
      total: sprints.length,
    };
  }

  private toResult(sprint: SprintEntity): ProjectSprintListItemResult {
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

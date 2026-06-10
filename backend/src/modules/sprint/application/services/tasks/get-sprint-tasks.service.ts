import { Inject, Injectable } from '@nestjs/common';

import { SprintPermissionService } from '../permissions/sprint-permission.service';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type {
  SprintRepositoryPort,
  SprintTaskDetails,
} from '../../../domain/ports/sprint.repository.port';

import {
  SprintNotFoundError,
  SprintProjectAccessDeniedError,
  SprintProjectNotFoundError,
  SprintWorkspaceNotFoundError,
} from '../../../domain/errors/sprint-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { SprintId } from '../../../domain/value-objects/sprint-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type SprintTaskListItemResult = SprintTaskDetails;

export type GetSprintTasksInput = {
  workspaceId: string;
  projectId: string;
  sprintId: string;
  userId: string;
};

export type GetSprintTasksResult = {
  items: SprintTaskListItemResult[];
  total: number;
};

@Injectable()
export class GetSprintTasksService {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepositoryPort,
    private readonly sprintPermissionService: SprintPermissionService,
  ) {}

  async execute(input: GetSprintTasksInput): Promise<GetSprintTasksResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const sprintId = SprintId.create(input.sprintId);
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

    const sprint = await this.sprintRepository.findByProjectAndId(
      projectId,
      sprintId,
    );

    if (!sprint) {
      throw new SprintNotFoundError();
    }

    const canViewSprints = await this.sprintPermissionService.canViewSprints({
      workspaceId,
      projectId,
      userId,
    });

    if (!canViewSprints) {
      throw new SprintProjectAccessDeniedError();
    }

    const sprintTasks =
      await this.sprintRepository.findActiveSprintTasksBySprintId(sprintId);

    return {
      items: sprintTasks,
      total: sprintTasks.length,
    };
  }
}

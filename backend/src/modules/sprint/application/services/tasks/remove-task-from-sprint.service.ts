import { Inject, Injectable } from '@nestjs/common';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type { SprintRepositoryPort } from '../../../domain/ports/sprint.repository.port';

import { SprintTaskEntity } from '../../../domain/entities/sprint-task.entity';

import {
  SprintCannotRemoveTasksError,
  SprintNotFoundError,
  SprintProjectNotFoundError,
  SprintTaskAlreadyRemovedError,
  SprintTaskNotFoundError,
  SprintTaskSprintMismatchError,
  SprintWorkspaceNotFoundError,
} from '../../../domain/errors/sprint-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { SprintId } from '../../../domain/value-objects/sprint-id.vo';
import { SprintTaskId } from '../../../domain/value-objects/sprint-task-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type RemoveTaskFromSprintInput = {
  workspaceId: string;
  projectId: string;
  sprintId: string;
  sprintTaskId: string;
};

export type RemoveTaskFromSprintResult = {
  message: string;
};

@Injectable()
export class RemoveTaskFromSprintService {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepositoryPort,
  ) { }

  async execute(
    input: RemoveTaskFromSprintInput,
  ): Promise<RemoveTaskFromSprintResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const sprintId = SprintId.create(input.sprintId);
    const sprintTaskId = SprintTaskId.create(input.sprintTaskId);

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

    if (
      sprint.getStatus() === 'COMPLETED' ||
      sprint.getStatus() === 'CANCELLED'
    ) {
      throw new SprintCannotRemoveTasksError();
    }

    const existingSprintTask =
      await this.sprintRepository.findSprintTaskById(sprintTaskId);

    if (!existingSprintTask) {
      throw new SprintTaskNotFoundError();
    }

    if (existingSprintTask.sprintId !== sprintId.value) {
      throw new SprintTaskSprintMismatchError();
    }

    if (existingSprintTask.removedAt !== null) {
      throw new SprintTaskAlreadyRemovedError();
    }

    const sprintTask = SprintTaskEntity.restore({
      id: SprintTaskId.create(existingSprintTask.id),
      sprintId: SprintId.create(existingSprintTask.sprintId),
      taskId: TaskId.create(existingSprintTask.taskId),
      position: existingSprintTask.position,
      addedAt: existingSprintTask.addedAt,
      removedAt: existingSprintTask.removedAt,
    });

    sprintTask.markRemoved();

    await this.sprintRepository.updateSprintTask(sprintTask);

    return {
      message: 'Task removed from sprint successfully.',
    };
  }
}
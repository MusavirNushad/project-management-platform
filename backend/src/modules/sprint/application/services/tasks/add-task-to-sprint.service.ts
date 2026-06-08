import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { SprintPermissionService } from '../permissions/sprint-permission.service';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type {
    SprintRepositoryPort,
    SprintTaskDetails,
} from '../../../domain/ports/sprint.repository.port';

import { SprintTaskEntity } from '../../../domain/entities/sprint-task.entity';

import {
    InvalidSprintTaskPositionError,
    SprintCannotAcceptTasksError,
    SprintNotFoundError,
    SprintProjectAccessDeniedError,
    SprintProjectNotFoundError,
    SprintTaskReferenceNotFoundError,
    SprintWorkspaceNotFoundError,
    TaskAlreadyInActiveSprintError,
} from '../../../domain/errors/sprint-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { SprintId } from '../../../domain/value-objects/sprint-id.vo';
import { SprintTaskId } from '../../../domain/value-objects/sprint-task-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type AddTaskToSprintInput = {
    workspaceId: string;
    projectId: string;
    sprintId: string;
    taskId: string;
    userId: string;
    position?: number | null;
};

export type AddTaskToSprintResult = SprintTaskDetails;

@Injectable()
export class AddTaskToSprintService {
    constructor(
        @Inject(SPRINT_REPOSITORY)
        private readonly sprintRepository: SprintRepositoryPort,
        private readonly sprintPermissionService: SprintPermissionService,
    ) { }

    async execute(
        input: AddTaskToSprintInput,
    ): Promise<AddTaskToSprintResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const sprintId = SprintId.create(input.sprintId);
        const taskId = TaskId.create(input.taskId);
        const userId = UserId.create(input.userId);

        const position = this.normalizePosition(input.position);

        const workspaceExists =
            await this.sprintRepository.workspaceExists(workspaceId);

        if (!workspaceExists) {
            throw new SprintWorkspaceNotFoundError();
        }

        const projectExists =
            await this.sprintRepository.projectExistsInWorkspace(
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
            throw new SprintCannotAcceptTasksError();
        }

        const canManageSprints =
            await this.sprintPermissionService.canManageSprints({
                workspaceId,
                projectId,
                userId,
            });

        if (!canManageSprints) {
            throw new SprintProjectAccessDeniedError();
        }

        const task = await this.sprintRepository.findTaskByProjectAndId(
            workspaceId,
            projectId,
            taskId,
        );

        if (!task) {
            throw new SprintTaskReferenceNotFoundError();
        }

        const activeSprintTask =
            await this.sprintRepository.findActiveSprintTaskByTaskId(taskId);

        if (activeSprintTask) {
            throw new TaskAlreadyInActiveSprintError();
        }

        const sprintTask = SprintTaskEntity.create({
            id: SprintTaskId.create(randomUUID()),
            sprintId,
            taskId,
            position,
        });

        return this.sprintRepository.saveSprintTask(sprintTask);
    }

    private normalizePosition(position?: number | null): number | null {
        if (position === undefined || position === null) {
            return null;
        }

        if (!Number.isInteger(position) || position < 1) {
            throw new InvalidSprintTaskPositionError();
        }

        return position;
    }
}
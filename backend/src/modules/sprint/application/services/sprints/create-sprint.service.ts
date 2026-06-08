import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { SprintPermissionService } from '../permissions/sprint-permission.service';

import { SPRINT_REPOSITORY } from '../../../domain/ports/sprint.repository.port';
import type { SprintRepositoryPort } from '../../../domain/ports/sprint.repository.port';

import {
    SprintEntity,
    type SprintStatus,
} from '../../../domain/entities/sprint.entity';

import {
    InvalidSprintDateRangeError,
    SprintProjectAccessDeniedError,
    SprintProjectNotFoundError,
    SprintWorkspaceNotFoundError,
} from '../../../domain/errors/sprint-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { SprintGoal } from '../../../domain/value-objects/sprint-goal.vo';
import { SprintId } from '../../../domain/value-objects/sprint-id.vo';
import { SprintName } from '../../../domain/value-objects/sprint-name.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type CreateSprintInput = {
    workspaceId: string;
    projectId: string;
    createdBy: string;
    name: string;
    goal?: string | null;
    startDate?: string | null;
    endDate?: string | null;
};

export type CreateSprintResult = {
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
export class CreateSprintService {
    constructor(
        @Inject(SPRINT_REPOSITORY)
        private readonly sprintRepository: SprintRepositoryPort,
        private readonly sprintPermissionService: SprintPermissionService,
    ) { }

    async execute(input: CreateSprintInput): Promise<CreateSprintResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const createdBy = UserId.create(input.createdBy);

        const name = SprintName.create(input.name);
        const goal = SprintGoal.create(input.goal);

        const startDate = this.parseOptionalDate(input.startDate);
        const endDate = this.parseOptionalDate(input.endDate);

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

        const canManageSprints =
            await this.sprintPermissionService.canManageSprints({
                workspaceId,
                projectId,
                userId: createdBy,
            });

        if (!canManageSprints) {
            throw new SprintProjectAccessDeniedError();
        }

        const sprint = SprintEntity.create({
            id: SprintId.create(randomUUID()),
            projectId,
            createdBy,
            name,
            goal,
            startDate,
            endDate,
        });

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

    private toResult(sprint: SprintEntity): CreateSprintResult {
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

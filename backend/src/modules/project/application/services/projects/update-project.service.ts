import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type { ProjectRepositoryPort } from '../../../domain/ports/project.repository.port';

import type {
  ProjectEntity,
  ProjectStatus,
} from '../../../domain/entities/project.entity';

import {
  InvalidProjectDateRangeError,
  ProjectNotFoundError,
  ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectDescription } from '../../../domain/value-objects/project-description.vo';
import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ProjectTitle } from '../../../domain/value-objects/project-title.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type UpdateProjectInput = {
  workspaceId: string;
  projectId: string;
  title?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  status?: ProjectStatus;
};

export type UpdateProjectResult = {
  id: string;
  workspaceId: string;
  createdBy: string;
  title: string;
  status: ProjectStatus;
  description: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
  ) { }

  async execute(input: UpdateProjectInput): Promise<UpdateProjectResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);

    const workspaceExists =
      await this.projectRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new ProjectWorkspaceNotFoundError();
    }

    const project = await this.projectRepository.findByWorkspaceAndId(
      workspaceId,
      projectId,
    );

    if (!project) {
      throw new ProjectNotFoundError();
    }

    const title =
      input.title !== undefined ? ProjectTitle.create(input.title) : undefined;

    const description =
      input.description !== undefined
        ? ProjectDescription.create(input.description)
        : undefined;

    const startDate =
      input.startDate !== undefined
        ? this.parseOptionalDate(input.startDate)
        : undefined;

    const dueDate =
      input.dueDate !== undefined
        ? this.parseOptionalDate(input.dueDate)
        : undefined;

    project.updateDetails({
      title,
      description,
      startDate,
      dueDate,
    });

    if (input.status !== undefined) {
      project.changeStatus(input.status);
    }

    const savedProject = await this.projectRepository.save(project);

    return this.toResult(savedProject);
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
      throw new InvalidProjectDateRangeError();
    }

    return date;
  }

  private toResult(project: ProjectEntity): UpdateProjectResult {
    return {
      id: project.getId(),
      workspaceId: project.getWorkspaceId(),
      createdBy: project.getCreatedBy(),
      title: project.getTitle(),
      status: project.getStatus(),
      description: project.getDescription(),
      startDate: project.getStartDate(),
      dueDate: project.getDueDate(),
      createdAt: project.getCreatedAt(),
      updatedAt: project.getUpdatedAt(),
    };
  }
}
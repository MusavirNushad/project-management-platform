import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type { ProjectRepositoryPort } from '../../../domain/ports/project.repository.port';

import { ProjectEntity } from '../../../domain/entities/project.entity';
import type { ProjectStatus } from '../../../domain/entities/project.entity';

import {
  InvalidProjectDateRangeError,
  ProjectCreatorRoleNotFoundError,
  ProjectWorkspaceAccessDeniedError,
  ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectDescription } from '../../../domain/value-objects/project-description.vo';
import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ProjectMemberId } from '../../../domain/value-objects/project-member-id.vo';
import { ProjectTitle } from '../../../domain/value-objects/project-title.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

const ProjectCreatorRoleName = 'ADMIN' as const;

export type CreateProjectInput = {
  workspaceId: string;
  createdBy: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
};

export type CreateProjectResult = {
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
export class CreateProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const createdBy = UserId.create(input.createdBy);

    const title = ProjectTitle.create(input.title);
    const description = ProjectDescription.create(input.description);

    const startDate = this.parseOptionalDate(input.startDate);
    const dueDate = this.parseOptionalDate(input.dueDate);

    const workspaceExists =
      await this.projectRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new ProjectWorkspaceNotFoundError();
    }

    const isWorkspaceOwner = await this.projectRepository.isWorkspaceOwner(
      workspaceId,
      createdBy,
    );

    if (!isWorkspaceOwner) {
      throw new ProjectWorkspaceAccessDeniedError();
    }

    const creatorRoleId = await this.projectRepository.findRoleIdByName(
      ProjectCreatorRoleName,
    );

    if (!creatorRoleId) {
      throw new ProjectCreatorRoleNotFoundError();
    }

    const project = ProjectEntity.create({
      id: ProjectId.create(randomUUID()),
      workspaceId,
      createdBy,
      title,
      description,
      startDate,
      dueDate,
      creatorMemberId: ProjectMemberId.create(randomUUID()),
      creatorRoleId,
    });

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

  private toResult(project: ProjectEntity): CreateProjectResult {
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

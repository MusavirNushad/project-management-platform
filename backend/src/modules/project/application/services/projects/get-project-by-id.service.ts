import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type { ProjectRepositoryPort } from '../../../domain/ports/project.repository.port';

import type {
  ProjectEntity,
  ProjectStatus,
} from '../../../domain/entities/project.entity';

import {
  ProjectNotFoundError,
  ProjectWorkspaceAccessDeniedError,
  ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type GetProjectByIdInput = {
  workspaceId: string;
  projectId: string;
  userId: string;
};

export type GetProjectByIdResult = {
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
export class GetProjectByIdService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
  ) {}

  async execute(input: GetProjectByIdInput): Promise<GetProjectByIdResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const userId = UserId.create(input.userId);

    const workspaceExists =
      await this.projectRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new ProjectWorkspaceNotFoundError();
    }

    const isWorkspaceMember = await this.projectRepository.isWorkspaceMember(
      workspaceId,
      userId,
    );

    if (!isWorkspaceMember) {
      throw new ProjectWorkspaceAccessDeniedError();
    }

    const project = await this.projectRepository.findByWorkspaceAndId(
      workspaceId,
      projectId,
    );

    if (!project) {
      throw new ProjectNotFoundError();
    }

    return this.toResult(project);
  }

  private toResult(project: ProjectEntity): GetProjectByIdResult {
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

import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type { ProjectRepositoryPort } from '../../../domain/ports/project.repository.port';

import type {
  ProjectEntity,
  ProjectStatus,
} from '../../../domain/entities/project.entity';

import {
  ProjectWorkspaceAccessDeniedError,
  ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type ProjectListItemResult = {
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

export type GetWorkspaceProjectsInput = {
  workspaceId: string;
  userId: string;
};

export type GetWorkspaceProjectsResult = {
  items: ProjectListItemResult[];
  total: number;
};

@Injectable()
export class GetWorkspaceProjectsService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
  ) {}

  async execute(
    input: GetWorkspaceProjectsInput,
  ): Promise<GetWorkspaceProjectsResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
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

    const projects =
      await this.projectRepository.findByWorkspaceId(workspaceId);

    const items = projects.map((project) => this.toListItem(project));

    return {
      items,
      total: items.length,
    };
  }

  private toListItem(project: ProjectEntity): ProjectListItemResult {
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

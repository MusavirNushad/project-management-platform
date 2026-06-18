import { Inject, Injectable } from '@nestjs/common';

import { WORKSPACE_REPOSITORY } from '../../../domain/ports/workspace.repository.port';
import type { WorkspaceRepositoryPort } from '../../../domain/ports/workspace.repository.port';

import { WorkspaceNotFoundError } from '../../../domain/errors/workspace-domain.errors';

import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type GetWorkspaceByIdInput = {
  workspaceId: string;
};

export type GetWorkspaceByIdResult = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class GetWorkspaceByIdService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepositoryPort,
  ) { }

  async execute(input: GetWorkspaceByIdInput): Promise<GetWorkspaceByIdResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);

    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    return {
      id: workspace.getId(),
      ownerId: workspace.getOwnerId(),
      name: workspace.getName(),
      slug: workspace.getSlug(),
      description: workspace.getDescription(),
      createdAt: workspace.getCreatedAt(),
      updatedAt: workspace.getUpdatedAt(),
    };
  }
}
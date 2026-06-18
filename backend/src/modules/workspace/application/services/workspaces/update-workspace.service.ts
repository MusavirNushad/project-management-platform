import { Inject, Injectable } from '@nestjs/common';

import { WORKSPACE_REPOSITORY } from '../../../domain/ports/workspace.repository.port';
import type { WorkspaceRepositoryPort } from '../../../domain/ports/workspace.repository.port';

import {
  WorkspaceAlreadyExistsError,
  WorkspaceNotFoundError,
} from '../../../domain/errors/workspace-domain.errors';

import { WorkspaceDescription } from '../../../domain/value-objects/workspace-description.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';
import { WorkspaceName } from '../../../domain/value-objects/workspace-name.vo';
import { WorkspaceSlug } from '../../../domain/value-objects/workspace-slug.vo';

const MaxSlugGenerationAttempts = 10;

export type UpdateWorkspaceInput = {
  workspaceId: string;
  name?: string;
  description?: string | null;
};

export type UpdateWorkspaceResult = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateWorkspaceService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepositoryPort,
  ) { }

  async execute(input: UpdateWorkspaceInput): Promise<UpdateWorkspaceResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);

    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    const shouldUpdateName = input.name !== undefined;
    const shouldUpdateDescription = input.description !== undefined;

    if (!shouldUpdateName && !shouldUpdateDescription) {
      return this.toResult(workspace);
    }

    const name = shouldUpdateName
      ? WorkspaceName.create(input.name as string)
      : undefined;

    const slug = name
      ? await this.generateUniqueSlugForUpdate(name.value, workspaceId)
      : undefined;

    const description = shouldUpdateDescription
      ? WorkspaceDescription.create(input.description)
      : undefined;

    workspace.updateDetails({
      name,
      slug,
      description,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    return this.toResult(savedWorkspace);
  }

  private async generateUniqueSlugForUpdate(
    name: string,
    currentWorkspaceId: WorkspaceId,
  ): Promise<WorkspaceSlug> {
    const baseSlug = WorkspaceSlug.fromName(name);

    for (let attempt = 1; attempt <= MaxSlugGenerationAttempts; attempt++) {
      const slug =
        attempt === 1
          ? baseSlug
          : WorkspaceSlug.create(`${baseSlug.value}-${attempt}`);

      const existingWorkspace = await this.workspaceRepository.findBySlug(slug);

      if (!existingWorkspace) {
        return slug;
      }

      if (existingWorkspace.getId() === currentWorkspaceId.value) {
        return slug;
      }
    }

    throw new WorkspaceAlreadyExistsError();
  }

  private toResult(workspace: {
    getId(): string;
    getOwnerId(): string;
    getName(): string;
    getSlug(): string;
    getDescription(): string | null;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
  }): UpdateWorkspaceResult {
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
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { WORKSPACE_REPOSITORY } from '../../../domain/ports/workspace.repository.port';
import type { WorkspaceRepositoryPort } from '../../../domain/ports/workspace.repository.port';

import { WorkspaceEntity } from '../../../domain/entities/workspace.entity';
import {
    WorkspaceAlreadyExistsError,
    WorkspaceOwnerRoleNotFoundError,
} from '../../../domain/errors/workspace-domain.errors';

import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceDescription } from '../../../domain/value-objects/workspace-description.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';
import { WorkspaceMemberId } from '../../../domain/value-objects/workspace-member-id.vo';
import { WorkspaceName } from '../../../domain/value-objects/workspace-name.vo';
import { WorkspaceSlug } from '../../../domain/value-objects/workspace-slug.vo';

const OwnerRoleName = 'OWNER' as const;
const MaxSlugGenerationAttempts = 10;

export type CreateWorkspaceInput = {
    ownerId: string;
    name: string;
    description?: string | null;
};

export type CreateWorkspaceResult = {
    id: string;
    ownerId: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
};

@Injectable()
export class CreateWorkspaceService {
    constructor(
        @Inject(WORKSPACE_REPOSITORY)
        private readonly workspaceRepository: WorkspaceRepositoryPort,
    ) { }

    async execute(input: CreateWorkspaceInput): Promise<CreateWorkspaceResult> {
        const ownerId = UserId.create(input.ownerId);
        const name = WorkspaceName.create(input.name);
        const description = WorkspaceDescription.create(input.description);

        const ownerRoleId =
            await this.workspaceRepository.findRoleIdByName(OwnerRoleName);

        if (!ownerRoleId) {
            throw new WorkspaceOwnerRoleNotFoundError();
        }

        const slug = await this.generateUniqueSlug(name.value);

        const workspace = WorkspaceEntity.create({
            id: WorkspaceId.create(randomUUID()),
            ownerId,
            name,
            slug,
            description,
            ownerMemberId: WorkspaceMemberId.create(randomUUID()),
            ownerRoleId,
        });

        const savedWorkspace = await this.workspaceRepository.save(workspace);

        return this.toResult(savedWorkspace);
    }

    private async generateUniqueSlug(name: string): Promise<WorkspaceSlug> {
        const baseSlug = WorkspaceSlug.fromName(name);

        for (let attempt = 1; attempt <= MaxSlugGenerationAttempts; attempt++) {
            const slug =
                attempt === 1
                    ? baseSlug
                    : WorkspaceSlug.create(`${baseSlug.value}-${attempt}`);

            const exists = await this.workspaceRepository.existsBySlug(slug);

            if (!exists) {
                return slug;
            }
        }

        throw new WorkspaceAlreadyExistsError();
    }

    private toResult(workspace: WorkspaceEntity): CreateWorkspaceResult {
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
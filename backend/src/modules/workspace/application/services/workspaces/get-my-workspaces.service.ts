import { Inject, Injectable } from '@nestjs/common';

import { WORKSPACE_REPOSITORY } from '../../../domain/ports/workspace.repository.port';
import type { WorkspaceRepositoryPort } from '../../../domain/ports/workspace.repository.port';

import type { WorkspaceEntity } from '../../../domain/entities/workspace.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';

export type WorkspaceListItemResult = {
    id: string;
    ownerId: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type GetMyWorkspacesInput = {
    userId: string;
};

export type GetMyWorkspacesResult = {
    items: WorkspaceListItemResult[];
    total: number;
};

@Injectable()
export class GetMyWorkspacesService {
    constructor(
        @Inject(WORKSPACE_REPOSITORY)
        private readonly workspaceRepository: WorkspaceRepositoryPort,
    ) { }

    async execute(input: GetMyWorkspacesInput): Promise<GetMyWorkspacesResult> {
        const userId = UserId.create(input.userId);

        const workspaces = await this.workspaceRepository.findByMemberUserId(userId);

        const items = workspaces.map((workspace) => this.toListItem(workspace));

        return {
            items,
            total: items.length,
        };
    }

    private toListItem(workspace: WorkspaceEntity): WorkspaceListItemResult {
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
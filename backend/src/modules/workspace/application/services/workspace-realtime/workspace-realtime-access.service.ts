import { Inject, Injectable, Logger } from '@nestjs/common';

import {
    WORKSPACE_REPOSITORY,
    type WorkspaceRepositoryPort,
} from '../../../domain/ports/workspace.repository.port';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

@Injectable()
export class WorkspaceRealtimeAccessService {
    private readonly logger = new Logger(WorkspaceRealtimeAccessService.name);

    constructor(
        @Inject(WORKSPACE_REPOSITORY)
        private readonly workspaceRepository: WorkspaceRepositoryPort,
    ) { }

    async canJoinWorkspace(params: {
        userId: string;
        workspaceId: string;
    }): Promise<boolean> {
        try {
            const workspaceId = WorkspaceId.create(params.workspaceId);
            const userId = UserId.create(params.userId);

            return await this.workspaceRepository.isUserMember(workspaceId, userId);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Workspace realtime access check failed. workspaceId=${params.workspaceId}, userId=${params.userId}, reason=${message}`,
            );

            return false;
        }
    }
}
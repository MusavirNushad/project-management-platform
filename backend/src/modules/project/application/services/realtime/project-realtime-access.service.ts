import { Inject, Injectable, Logger } from '@nestjs/common';

import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryPort,
} from '../../../domain/ports/project.repository.port';
import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

@Injectable()
export class ProjectRealtimeAccessService {
    private readonly logger = new Logger(ProjectRealtimeAccessService.name);

    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryPort,
    ) { }

    async canJoinProject(params: {
        userId: string;
        projectId: string;
    }): Promise<boolean> {
        try {
            const projectId = ProjectId.create(params.projectId);
            const userId = UserId.create(params.userId);

            const member =
                await this.projectRepository.findProjectMemberDetailsByProjectAndUser(
                    projectId,
                    userId,
                );

            return Boolean(member);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Project realtime access check failed. projectId=${params.projectId}, userId=${params.userId}, reason=${message}`,
            );

            return false;
        }
    }
}
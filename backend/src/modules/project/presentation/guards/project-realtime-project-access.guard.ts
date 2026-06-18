import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import type { AuthenticatedSocket } from '../../../../shared/infrastructure/realtime/types/authenticated-socket.type';

import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryPort,
} from '../../domain/ports/project.repository.port';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

type JoinProjectRoomPayload = {
    projectId?: unknown;
};

@Injectable()
export class ProjectRealtimeProjectAccessGuard implements CanActivate {
    private readonly logger = new Logger(ProjectRealtimeProjectAccessGuard.name);

    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryPort,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();
        const payload = context.switchToWs().getData<JoinProjectRoomPayload>();

        const userId = client.data.user?.userId;
        const projectId = payload.projectId;

        if (!userId || typeof projectId !== 'string') {
            throw new WsException('You are not allowed to join this project room.');
        }

        try {
            const member =
                await this.projectRepository.findProjectMemberDetailsByProjectAndUser(
                    ProjectId.create(projectId),
                    UserId.create(userId),
                );

            if (!member) {
                throw new WsException('You are not allowed to join this project room.');
            }

            return true;
        } catch (error) {
            if (error instanceof WsException) {
                throw error;
            }

            const message = error instanceof Error ? error.message : String(error);

            this.logger.warn(
                `Project realtime access check failed. projectId=${projectId}, userId=${userId}, reason=${message}`,
            );

            throw new WsException('You are not allowed to join this project room.');
        }
    }
}
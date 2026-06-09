import type { CreateWorklogResult } from '../../../application/services/worklogs/create-worklog.service';
import type { GetWorklogByIdResult } from '../../../application/services/worklogs/get-worklog-by-id.service';
import type { UpdateWorklogResult } from '../../../application/services/worklogs/update-worklog.service';

type WorklogServiceResult = CreateWorklogResult | GetWorklogByIdResult | UpdateWorklogResult;

export class WorklogUserResponseDto {
    id!: string;
    name!: string;
    email!: string;
}

export class WorklogResponseDto {
    id!: string;
    userId!: string;
    projectId!: string;
    taskId!: string;
    startedAt!: Date;
    endedAt!: Date | null;
    durationMin!: number | null;
    description!: string | null;
    createdAt!: Date;
    user!: WorklogUserResponseDto;

    static fromResult(result: WorklogServiceResult): WorklogResponseDto {
        return {
            id: result.id,
            userId: result.userId,
            projectId: result.projectId,
            taskId: result.taskId,
            startedAt: result.startedAt,
            endedAt: result.endedAt,
            durationMin: result.durationMin,
            description: result.description,
            createdAt: result.createdAt,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
            },
        };
    }
}
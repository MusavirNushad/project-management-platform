import type { CreateSprintResult } from '../../../application/services/sprints/create-sprint.service';
import type { GetSprintByIdResult } from '../../../application/services/sprints/get-sprint-by-id.service';
import type { UpdateSprintResult } from '../../../application/services/sprints/update-sprint.service';

type SprintServiceResult =
    | CreateSprintResult
    | GetSprintByIdResult
    | UpdateSprintResult;

export class SprintResponseDto {
    id!: string;
    projectId!: string;
    createdBy!: string;
    name!: string;
    goal!: string | null;
    status!: string;
    startDate!: Date | null;
    endDate!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;

    static fromResult(result: SprintServiceResult): SprintResponseDto {
        return {
            id: result.id,
            projectId: result.projectId,
            createdBy: result.createdBy,
            name: result.name,
            goal: result.goal,
            status: result.status,
            startDate: result.startDate,
            endDate: result.endDate,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
    }
}

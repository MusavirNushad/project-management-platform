import type {
    GetWorkspaceProjectsResult,
    ProjectListItemResult,
} from '../../../application/services/projects/get-workspace-projects.service';

export class ProjectListItemResponseDto {
    id!: string;
    workspaceId!: string;
    createdBy!: string;
    title!: string;
    status!: string;
    description!: string | null;
    startDate!: Date | null;
    dueDate!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;

    static fromResult(result: ProjectListItemResult): ProjectListItemResponseDto {
        return {
            id: result.id,
            workspaceId: result.workspaceId,
            createdBy: result.createdBy,
            title: result.title,
            status: result.status,
            description: result.description,
            startDate: result.startDate,
            dueDate: result.dueDate,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
    }
}

export class ProjectListResponseDto {
    items!: ProjectListItemResponseDto[];
    total!: number;

    static fromResult(result: GetWorkspaceProjectsResult): ProjectListResponseDto {
        return {
            items: result.items.map(ProjectListItemResponseDto.fromResult),
            total: result.total,
        };
    }
}
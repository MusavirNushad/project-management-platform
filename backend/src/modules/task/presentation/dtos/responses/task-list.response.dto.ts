import type {
    GetProjectTasksResult,
    ProjectTaskListItemResult,
} from '../../../application/services/tasks/get-project-tasks.service';

export class TaskListItemResponseDto {
    id!: string;
    workspaceId!: string;
    projectId!: string;
    reporterId!: string;
    assigneeId!: string | null;
    title!: string;
    description!: string | null;
    status!: string;
    priority!: string;
    startDate!: Date | null;
    dueDate!: Date | null;
    completedAt!: Date | null;
    isCompleted!: boolean;
    attachments!: unknown[];
    createdAt!: Date;
    updatedAt!: Date;

    static fromResult(result: ProjectTaskListItemResult): TaskListItemResponseDto {
        return {
            id: result.id,
            workspaceId: result.workspaceId,
            projectId: result.projectId,
            reporterId: result.reporterId,
            assigneeId: result.assigneeId,
            title: result.title,
            description: result.description,
            status: result.status,
            priority: result.priority,
            startDate: result.startDate,
            dueDate: result.dueDate,
            completedAt: result.completedAt,
            isCompleted: result.isCompleted,
            attachments: result.attachments,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
    }
}

export class TaskListResponseDto {
    items!: TaskListItemResponseDto[];
    total!: number;

    static fromResult(result: GetProjectTasksResult): TaskListResponseDto {
        return {
            items: result.items.map(TaskListItemResponseDto.fromResult),
            total: result.total,
        };
    }
}
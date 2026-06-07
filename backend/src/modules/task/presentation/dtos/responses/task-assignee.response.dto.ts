import type { AddTaskAssigneeResult } from '../../../application/services/assignees/add-task-assignee.service';

type TaskAssigneeServiceResult = AddTaskAssigneeResult;

export class TaskAssigneeUserResponseDto {
    id!: string;
    name!: string;
    email!: string;
}

export class TaskAssigneeResponseDto {
    id!: string;
    taskId!: string;
    userId!: string;
    assignedBy!: string;
    workspaceId!: string;
    projectId!: string;
    user!: TaskAssigneeUserResponseDto;
    assignedByUser!: TaskAssigneeUserResponseDto;
    assignedAt!: Date;

    static fromResult(
        result: TaskAssigneeServiceResult,
    ): TaskAssigneeResponseDto {
        return {
            id: result.id,
            taskId: result.taskId,
            userId: result.userId,
            assignedBy: result.assignedBy,
            workspaceId: result.workspaceId,
            projectId: result.projectId,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
            },
            assignedByUser: {
                id: result.assignedByUser.id,
                name: result.assignedByUser.name,
                email: result.assignedByUser.email,
            },
            assignedAt: result.assignedAt,
        };
    }
}
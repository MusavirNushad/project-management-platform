import type { AddTaskToSprintResult } from '../../../application/services/tasks/add-task-to-sprint.service';

type SprintTaskServiceResult = AddTaskToSprintResult;

export class SprintTaskTaskResponseDto {
    id!: string;
    title!: string;
    status!: string;
    priority!: string;
}

export class SprintTaskResponseDto {
    id!: string;
    sprintId!: string;
    taskId!: string;
    position!: number | null;
    addedAt!: Date;
    removedAt!: Date | null;
    task!: SprintTaskTaskResponseDto;

    static fromResult(result: SprintTaskServiceResult): SprintTaskResponseDto {
        return {
            id: result.id,
            sprintId: result.sprintId,
            taskId: result.taskId,
            position: result.position,
            addedAt: result.addedAt,
            removedAt: result.removedAt,
            task: {
                id: result.task.id,
                title: result.task.title,
                status: result.task.status,
                priority: result.task.priority,
            },
        };
    }
}
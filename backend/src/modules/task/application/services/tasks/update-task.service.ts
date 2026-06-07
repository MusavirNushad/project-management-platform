import { Inject, Injectable } from '@nestjs/common';

import { TaskPermissionService } from '../permissions/task-permission.service';

import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../../domain/ports/task.repository.port';

import {
    TaskEntity,
    type TaskPriority,
    type TaskStatus,
} from '../../../domain/entities/task.entity';

import {
    InvalidTaskDateRangeError,
    TaskAccessDeniedError,
    TaskNotFoundError,
    TaskProjectNotFoundError,
    TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskDescription } from '../../../domain/value-objects/task-description.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { TaskTitle } from '../../../domain/value-objects/task-title.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type UpdateTaskInput = {
    workspaceId: string;
    projectId: string;
    taskId: string;
    userId: string;
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string | null;
    dueDate?: string | null;
};

export type UpdateTaskResult = {
    id: string;
    workspaceId: string;
    projectId: string;
    reporterId: string;
    assigneeId: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    startDate: Date | null;
    dueDate: Date | null;
    completedAt: Date | null;
    isCompleted: boolean;
    attachments: unknown[];
    createdAt: Date;
    updatedAt: Date;
};

@Injectable()
export class UpdateTaskService {
    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: TaskRepositoryPort,
        private readonly taskPermissionService: TaskPermissionService,
    ) { }

    async execute(input: UpdateTaskInput): Promise<UpdateTaskResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const taskId = TaskId.create(input.taskId);
        const userId = UserId.create(input.userId);

        const workspaceExists = await this.taskRepository.workspaceExists(workspaceId);

        if (!workspaceExists) {
            throw new TaskWorkspaceNotFoundError();
        }

        const projectExists = await this.taskRepository.projectExistsInWorkspace(
            workspaceId,
            projectId,
        );

        if (!projectExists) {
            throw new TaskProjectNotFoundError();
        }

        const task = await this.taskRepository.findByProjectAndId(
            workspaceId,
            projectId,
            taskId,
        );

        if (!task) {
            throw new TaskNotFoundError();
        }

        const canUpdateTask = await this.taskPermissionService.canUpdateTask({
            workspaceId,
            projectId,
            userId,
            task,
        });

        if (!canUpdateTask) {
            throw new TaskAccessDeniedError();
        }

        const title =
            input.title !== undefined ? TaskTitle.create(input.title) : undefined;

        const description =
            input.description !== undefined
                ? TaskDescription.create(input.description)
                : undefined;

        const startDate =
            input.startDate !== undefined
                ? this.parseOptionalDate(input.startDate)
                : undefined;

        const dueDate =
            input.dueDate !== undefined
                ? this.parseOptionalDate(input.dueDate)
                : undefined;

        task.updateDetails({
            title,
            description,
            priority: input.priority,
            startDate,
            dueDate,
        });

        if (input.status !== undefined) {
            task.changeStatus(input.status);
        }

        const savedTask = await this.taskRepository.save(task);

        return this.toResult(savedTask);
    }

    private parseOptionalDate(value?: string | null): Date | null {
        if (value === undefined || value === null) {
            return null;
        }

        const normalizedValue = value.trim();

        if (normalizedValue.length === 0) {
            return null;
        }

        const date = new Date(normalizedValue);

        if (Number.isNaN(date.getTime())) {
            throw new InvalidTaskDateRangeError();
        }

        return date;
    }

    private toResult(task: TaskEntity): UpdateTaskResult {
        return {
            id: task.getId(),
            workspaceId: task.getWorkspaceId(),
            projectId: task.getProjectId(),
            reporterId: task.getReporterId(),
            assigneeId: task.getAssigneeId(),
            title: task.getTitle(),
            description: task.getDescription(),
            status: task.getStatus(),
            priority: task.getPriority(),
            startDate: task.getStartDate(),
            dueDate: task.getDueDate(),
            completedAt: task.getCompletedAt(),
            isCompleted: task.getIsCompleted(),
            attachments: task.getAttachments(),
            createdAt: task.getCreatedAt(),
            updatedAt: task.getUpdatedAt(),
        };
    }
}
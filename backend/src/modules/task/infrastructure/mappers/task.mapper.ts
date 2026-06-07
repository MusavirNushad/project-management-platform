import { Prisma } from '@prisma/client';

import {
    TaskEntity,
    type TaskPriority,
    type TaskStatus,
} from '../../domain/entities/task.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { TaskDescription } from '../../domain/value-objects/task-description.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { TaskTitle } from '../../domain/value-objects/task-title.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

import { TaskAssigneeMapper } from './task-assignee.mapper';

export type PrismaTaskWithAssignees = Prisma.TaskGetPayload<{
    include: {
        assignees: true;
    };
}>;

export class TaskMapper {
    static toDomain(task: PrismaTaskWithAssignees): TaskEntity {
        return TaskEntity.restore({
            id: TaskId.create(task.id),
            workspaceId: WorkspaceId.create(task.workspaceId),
            projectId: ProjectId.create(task.projectId),
            reporterId: UserId.create(task.reporterId),
            assigneeId: task.assigneeId ? UserId.create(task.assigneeId) : null,
            title: TaskTitle.create(task.title),
            description: TaskDescription.create(task.description),
            status: task.status as TaskStatus,
            priority: task.priority as TaskPriority,
            startDate: task.startDate,
            dueDate: task.dueDate,
            completedAt: task.completedAt,
            isCompleted: task.isCompleted,
            attachments: TaskMapper.toUnknownArray(task.attachments),
            assignees: task.assignees.map((assignee) =>
                TaskAssigneeMapper.toDomain(assignee),
            ),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        });
    }

    static toPrismaCreate(task: TaskEntity): Prisma.TaskUncheckedCreateInput {
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
            attachments: task.getAttachments() as Prisma.InputJsonValue,
            createdAt: task.getCreatedAt(),
            updatedAt: task.getUpdatedAt(),
        };
    }

    static toPrismaUpdate(task: TaskEntity): Prisma.TaskUncheckedUpdateInput {
        return {
            title: task.getTitle(),
            description: task.getDescription(),
            status: task.getStatus(),
            priority: task.getPriority(),
            startDate: task.getStartDate(),
            dueDate: task.getDueDate(),
            completedAt: task.getCompletedAt(),
            isCompleted: task.getIsCompleted(),
            attachments: task.getAttachments() as Prisma.InputJsonValue,
            updatedAt: task.getUpdatedAt(),
        };
    }

    private static toUnknownArray(value: Prisma.JsonValue): unknown[] {
        return Array.isArray(value) ? value : [];
    }
}
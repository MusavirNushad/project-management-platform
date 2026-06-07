import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

import type {
    ProjectMemberDetailsForTask,
    ProjectMemberRoleName,
    TaskAssigneeDetails,
    TaskCommentDetails,
    TaskRepositoryPort,
    TaskUserDetails,
} from '../../domain/ports/task.repository.port';

import { TaskAssigneeAlreadyExistsError } from '../../domain/errors/task-domain.errors';

import { TaskAssigneeEntity } from '../../domain/entities/task-assignee.entity';
import { TaskCommentEntity } from '../../domain/entities/task-comment.entity';
import { TaskEntity } from '../../domain/entities/task.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { TaskAssigneeId } from '../../domain/value-objects/task-assignee-id.vo';
import { TaskCommentId } from '../../domain/value-objects/task-comment-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

import { TaskAssigneeMapper } from '../mappers/task-assignee.mapper';
import { TaskCommentMapper } from '../mappers/task-comment.mapper';
import { TaskMapper } from '../mappers/task.mapper';

type PrismaTaskAssigneeWithDetails = Prisma.TaskAssigneeGetPayload<{
    include: {
        user: {
            select: {
                id: true;
                name: true;
                email: true;
            };
        };
        assignedBy: {
            select: {
                id: true;
                name: true;
                email: true;
            };
        };
    };
}>;

type PrismaTaskCommentWithDetails = Prisma.CommentGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                name: true;
                email: true;
            };
        };
    };
}>;

type PrismaProjectMemberWithRole = Prisma.ProjectMemberGetPayload<{
    include: {
        role: {
            select: {
                id: true;
                name: true;
            };
        };
    };
}>;

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async save(task: TaskEntity): Promise<TaskEntity> {
        const savedTask = await this.prisma.$transaction(async (tx) => {
            const prismaTask = await tx.task.upsert({
                where: {
                    id: task.getId(),
                },
                create: TaskMapper.toPrismaCreate(task),
                update: TaskMapper.toPrismaUpdate(task),
                include: {
                    assignees: true,
                },
            });

            const assignees = task.getAssignees();

            for (const assignee of assignees) {
                await tx.taskAssignee.upsert({
                    where: {
                        taskId_userId: {
                            taskId: assignee.getTaskId(),
                            userId: assignee.getUserId(),
                        },
                    },
                    create: TaskAssigneeMapper.toPrismaCreate(assignee),
                    update: {},
                });
            }

            return tx.task.findUniqueOrThrow({
                where: {
                    id: prismaTask.id,
                },
                include: {
                    assignees: true,
                },
            });
        });

        return TaskMapper.toDomain(savedTask);
    }

    async findById(taskId: TaskId): Promise<TaskEntity | null> {
        const task = await this.prisma.task.findUnique({
            where: {
                id: taskId.value,
            },
            include: {
                assignees: true,
            },
        });

        return task ? TaskMapper.toDomain(task) : null;
    }

    async findByProjectAndId(
        workspaceId: WorkspaceId,
        projectId: ProjectId,
        taskId: TaskId,
    ): Promise<TaskEntity | null> {
        const task = await this.prisma.task.findFirst({
            where: {
                id: taskId.value,
                workspaceId: workspaceId.value,
                projectId: projectId.value,
            },
            include: {
                assignees: true,
            },
        });

        return task ? TaskMapper.toDomain(task) : null;
    }

    async findByProjectId(
        workspaceId: WorkspaceId,
        projectId: ProjectId,
    ): Promise<TaskEntity[]> {
        const tasks = await this.prisma.task.findMany({
            where: {
                workspaceId: workspaceId.value,
                projectId: projectId.value,
            },
            include: {
                assignees: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return tasks.map((task) => TaskMapper.toDomain(task));
    }

    async workspaceExists(workspaceId: WorkspaceId): Promise<boolean> {
        const count = await this.prisma.workspace.count({
            where: {
                id: workspaceId.value,
            },
        });

        return count > 0;
    }

    async projectExistsInWorkspace(
        workspaceId: WorkspaceId,
        projectId: ProjectId,
    ): Promise<boolean> {
        const count = await this.prisma.project.count({
            where: {
                id: projectId.value,
                workspaceId: workspaceId.value,
            },
        });

        return count > 0;
    }

    async isWorkspaceOwner(
        workspaceId: WorkspaceId,
        userId: UserId,
    ): Promise<boolean> {
        const count = await this.prisma.workspace.count({
            where: {
                id: workspaceId.value,
                ownerId: userId.value,
            },
        });

        return count > 0;
    }

    async isProjectMember(
        projectId: ProjectId,
        userId: UserId,
    ): Promise<boolean> {
        const count = await this.prisma.projectMember.count({
            where: {
                projectId: projectId.value,
                userId: userId.value,
            },
        });

        return count > 0;
    }

    async findProjectMemberByProjectAndUser(
        projectId: ProjectId,
        userId: UserId,
    ): Promise<ProjectMemberDetailsForTask | null> {
        const projectMember = await this.prisma.projectMember.findFirst({
            where: {
                projectId: projectId.value,
                userId: userId.value,
            },
            include: {
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return projectMember
            ? this.toProjectMemberDetailsForTask(projectMember)
            : null;
    }

    async findUserById(userId: UserId): Promise<TaskUserDetails | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId.value,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        return user ? this.toUserDetails(user) : null;
    }

    async saveTaskAssignee(
        taskAssignee: TaskAssigneeEntity,
    ): Promise<TaskAssigneeDetails> {
        try {
            const createdAssignee = await this.prisma.taskAssignee.create({
                data: TaskAssigneeMapper.toPrismaCreate(taskAssignee),
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    assignedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            return this.toTaskAssigneeDetails(createdAssignee);
        } catch (error) {
            if (this.isUniqueConstraintError(error)) {
                throw new TaskAssigneeAlreadyExistsError();
            }

            throw error;
        }
    }

    async findTaskAssigneesByTaskId(
        taskId: TaskId,
    ): Promise<TaskAssigneeDetails[]> {
        const assignees = await this.prisma.taskAssignee.findMany({
            where: {
                taskId: taskId.value,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                assignedAt: 'desc',
            },
        });

        return assignees.map((assignee) =>
            this.toTaskAssigneeDetails(assignee),
        );
    }

    async findTaskAssigneeById(
        assigneeId: TaskAssigneeId,
    ): Promise<TaskAssigneeDetails | null> {
        const assignee = await this.prisma.taskAssignee.findUnique({
            where: {
                id: assigneeId.value,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return assignee ? this.toTaskAssigneeDetails(assignee) : null;
    }

    async findTaskAssigneeByTaskAndUser(
        taskId: TaskId,
        userId: UserId,
    ): Promise<TaskAssigneeDetails | null> {
        const assignee = await this.prisma.taskAssignee.findUnique({
            where: {
                taskId_userId: {
                    taskId: taskId.value,
                    userId: userId.value,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return assignee ? this.toTaskAssigneeDetails(assignee) : null;
    }

    async deleteTaskAssigneeById(
        assigneeId: TaskAssigneeId,
    ): Promise<void> {
        await this.prisma.taskAssignee.delete({
            where: {
                id: assigneeId.value,
            },
        });
    }

    async saveTaskComment(
        comment: TaskCommentEntity,
    ): Promise<TaskCommentDetails> {
        const createdComment = await this.prisma.comment.create({
            data: TaskCommentMapper.toPrismaCreate(comment),
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return this.toTaskCommentDetails(createdComment);
    }

    async findTaskCommentsByTaskId(
        taskId: TaskId,
    ): Promise<TaskCommentDetails[]> {
        const comments = await this.prisma.comment.findMany({
            where: {
                taskId: taskId.value,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return comments.map((comment) => this.toTaskCommentDetails(comment));
    }

    async findTaskCommentById(
        commentId: TaskCommentId,
    ): Promise<TaskCommentDetails | null> {
        const comment = await this.prisma.comment.findUnique({
            where: {
                id: commentId.value,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return comment ? this.toTaskCommentDetails(comment) : null;
    }

    async updateTaskComment(
        comment: TaskCommentEntity,
    ): Promise<TaskCommentDetails> {
        const updatedComment = await this.prisma.comment.update({
            where: {
                id: comment.getId(),
            },
            data: TaskCommentMapper.toPrismaUpdate(comment),
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return this.toTaskCommentDetails(updatedComment);
    }

    async hasCommentReplies(commentId: TaskCommentId): Promise<boolean> {
        const count = await this.prisma.comment.count({
            where: {
                parentCommentId: commentId.value,
            },
        });

        return count > 0;
    }

    async deleteTaskCommentById(
        commentId: TaskCommentId,
    ): Promise<void> {
        await this.prisma.comment.delete({
            where: {
                id: commentId.value,
            },
        });
    }

    private toTaskAssigneeDetails(
        assignee: PrismaTaskAssigneeWithDetails,
    ): TaskAssigneeDetails {
        return {
            id: assignee.id,
            taskId: assignee.taskId,
            userId: assignee.userId,
            assignedBy: assignee.assignedById,
            workspaceId: assignee.workspaceId,
            projectId: assignee.projectId,
            user: this.toUserDetails(assignee.user),
            assignedByUser: this.toUserDetails(assignee.assignedBy),
            assignedAt: assignee.assignedAt,
        };
    }

    private toTaskCommentDetails(
        comment: PrismaTaskCommentWithDetails,
    ): TaskCommentDetails {
        return {
            id: comment.id,
            taskId: comment.taskId,
            authorId: comment.authorId,
            parentCommentId: comment.parentCommentId,
            body: comment.body,
            attachments: this.toUnknownArray(comment.attachments),
            author: this.toUserDetails(comment.author),
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };
    }

    private toProjectMemberDetailsForTask(
        projectMember: PrismaProjectMemberWithRole,
    ): ProjectMemberDetailsForTask {
        return {
            id: projectMember.id,
            projectId: projectMember.projectId,
            userId: projectMember.userId,
            role: {
                id: projectMember.role.id,
                name: projectMember.role.name as ProjectMemberRoleName,
            },
        };
    }

    private toUserDetails(user: {
        id: string;
        name: string;
        email: string;
    }): TaskUserDetails {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }

    private toUnknownArray(value: Prisma.JsonValue): unknown[] {
        return Array.isArray(value) ? value : [];
    }

    private isUniqueConstraintError(
        error: unknown,
    ): error is Prisma.PrismaClientKnownRequestError {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        );
    }
}

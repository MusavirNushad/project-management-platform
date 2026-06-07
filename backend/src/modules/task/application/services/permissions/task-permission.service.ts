import { Inject, Injectable } from '@nestjs/common';

import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../../domain/ports/task.repository.port';

import type { TaskEntity } from '../../../domain/entities/task.entity';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

type CanCreateTaskInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanViewProjectTasksInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanUpdateTaskInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
    task: TaskEntity;
};

type CanManageTaskAssigneesInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
    task: TaskEntity;
};

type CanViewTaskAssigneesInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanCreateTaskCommentInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanViewTaskCommentsInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanDeleteTaskCommentInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
    authorId: UserId;
};


@Injectable()
export class TaskPermissionService {
    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: TaskRepositoryPort,
    ) { }

    async canCreateTask(input: CanCreateTaskInput): Promise<boolean> {
        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.taskRepository.isProjectMember(input.projectId, input.userId);
    }

    async canViewProjectTasks(input: CanViewProjectTasksInput): Promise<boolean> {
        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.taskRepository.isProjectMember(input.projectId, input.userId);
    }

    async canUpdateTask(input: CanUpdateTaskInput): Promise<boolean> {
        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.taskRepository.findProjectMemberByProjectAndUser(
                input.projectId,
                input.userId,
            );

        if (!projectMember) {
            return false;
        }

        if (projectMember.role.name === 'ADMIN') {
            return true;
        }

        return input.task.isReportedBy(input.userId);
    }

    async canManageTaskAssignees(
        input: CanManageTaskAssigneesInput,
    ): Promise<boolean> {
        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.taskRepository.findProjectMemberByProjectAndUser(
                input.projectId,
                input.userId,
            );

        if (!projectMember) {
            return false;
        }

        if (projectMember.role.name === 'ADMIN') {
            return true;
        }

        return input.task.isReportedBy(input.userId);
    }

    async canViewTaskAssignees(
        input: CanViewTaskAssigneesInput,
    ): Promise<boolean> {
        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.taskRepository.isProjectMember(input.projectId, input.userId);
    }

    async canCreateTaskComment(
        input: CanCreateTaskCommentInput,
    ): Promise<boolean> {
        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.taskRepository.isProjectMember(input.projectId, input.userId);
    }


    async canViewTaskComments(
        input: CanViewTaskCommentsInput,
    ): Promise<boolean> {
        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.taskRepository.isProjectMember(input.projectId, input.userId);
    }

    async canDeleteTaskComment(
        input: CanDeleteTaskCommentInput,
    ): Promise<boolean> {
        if (input.authorId.equals(input.userId)) {
            return true;
        }

        const isWorkspaceOwner = await this.taskRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.taskRepository.findProjectMemberByProjectAndUser(
                input.projectId,
                input.userId,
            );

        return projectMember?.role.name === 'ADMIN';
    }
}

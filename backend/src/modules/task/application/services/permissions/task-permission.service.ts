import { Injectable } from '@nestjs/common';

import { AccessControlService } from '../../../../access-control/application/services/access-control.service';

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
  constructor(private readonly accessControlService: AccessControlService) {}

  async canCreateTask(input: CanCreateTaskInput): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canViewProjectTasks(input: CanViewProjectTasksInput): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canUpdateTask(input: CanUpdateTaskInput): Promise<boolean> {
    const canManageProject = await this.accessControlService.canManageProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });

    if (canManageProject) {
      return true;
    }

    const canAccessProject = await this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });

    if (!canAccessProject) {
      return false;
    }

    return input.task.isReportedBy(input.userId);
  }

  async canManageTaskAssignees(
    input: CanManageTaskAssigneesInput,
  ): Promise<boolean> {
    const canManageProject = await this.accessControlService.canManageProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });

    if (canManageProject) {
      return true;
    }

    const canAccessProject = await this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });

    if (!canAccessProject) {
      return false;
    }

    return input.task.isReportedBy(input.userId);
  }

  async canViewTaskAssignees(
    input: CanViewTaskAssigneesInput,
  ): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canCreateTaskComment(
    input: CanCreateTaskCommentInput,
  ): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canViewTaskComments(input: CanViewTaskCommentsInput): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canDeleteTaskComment(
    input: CanDeleteTaskCommentInput,
  ): Promise<boolean> {
    if (input.authorId.equals(input.userId)) {
      return true;
    }

    return this.accessControlService.canManageProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { TaskPermissionService } from '../permissions/task-permission.service';

import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type {
  TaskAssigneeDetails,
  TaskRepositoryPort,
} from '../../../domain/ports/task.repository.port';

import { TaskAssigneeEntity } from '../../../domain/entities/task-assignee.entity';

import {
  TaskAccessDeniedError,
  TaskAssigneeAlreadyExistsError,
  TaskAssigneeUserNotFoundError,
  TaskAssigneeUserNotProjectMemberError,
  TaskNotFoundError,
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskAssigneeId } from '../../../domain/value-objects/task-assignee-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type AddTaskAssigneeInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  actorUserId: string;
  targetUserId: string;
};

export type AddTaskAssigneeResult = TaskAssigneeDetails;

@Injectable()
export class AddTaskAssigneeService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
    private readonly taskPermissionService: TaskPermissionService,
  ) {}

  async execute(input: AddTaskAssigneeInput): Promise<AddTaskAssigneeResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const actorUserId = UserId.create(input.actorUserId);
    const targetUserId = UserId.create(input.targetUserId);

    const workspaceExists =
      await this.taskRepository.workspaceExists(workspaceId);

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

    const canManageTaskAssignees =
      await this.taskPermissionService.canManageTaskAssignees({
        workspaceId,
        projectId,
        userId: actorUserId,
        task,
      });

    if (!canManageTaskAssignees) {
      throw new TaskAccessDeniedError();
    }

    const targetUser = await this.taskRepository.findUserById(targetUserId);

    if (!targetUser) {
      throw new TaskAssigneeUserNotFoundError();
    }

    const targetProjectMember =
      await this.taskRepository.findProjectMemberByProjectAndUser(
        projectId,
        targetUserId,
      );

    if (!targetProjectMember) {
      throw new TaskAssigneeUserNotProjectMemberError();
    }

    const existingAssignee =
      await this.taskRepository.findTaskAssigneeByTaskAndUser(
        taskId,
        targetUserId,
      );

    if (existingAssignee) {
      throw new TaskAssigneeAlreadyExistsError();
    }

    const taskAssignee = TaskAssigneeEntity.create({
      id: TaskAssigneeId.create(randomUUID()),
      taskId,
      userId: targetUserId,
      assignedBy: actorUserId,
      workspaceId,
      projectId,
    });

    return this.taskRepository.saveTaskAssignee(taskAssignee);
  }
}

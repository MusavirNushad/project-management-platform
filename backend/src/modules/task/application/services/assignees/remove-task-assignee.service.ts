import { Inject, Injectable } from '@nestjs/common';


import { TASK_REPOSITORY } from '../../../domain/ports/task.repository.port';
import type { TaskRepositoryPort } from '../../../domain/ports/task.repository.port';

import {
  TaskAssigneeNotFoundError,
  TaskAssigneeTaskMismatchError,
  TaskNotFoundError,
  TaskProjectNotFoundError,
  TaskWorkspaceNotFoundError,
} from '../../../domain/errors/task-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { TaskAssigneeId } from '../../../domain/value-objects/task-assignee-id.vo';
import { TaskId } from '../../../domain/value-objects/task-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type RemoveTaskAssigneeInput = {
  workspaceId: string;
  projectId: string;
  taskId: string;
  assigneeId: string;
};

export type RemoveTaskAssigneeResult = {
  message: string;
};

@Injectable()
export class RemoveTaskAssigneeService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
  ) { }

  async execute(
    input: RemoveTaskAssigneeInput,
  ): Promise<RemoveTaskAssigneeResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const taskId = TaskId.create(input.taskId);
    const assigneeId = TaskAssigneeId.create(input.assigneeId);

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


    const assignee = await this.taskRepository.findTaskAssigneeById(assigneeId);

    if (!assignee) {
      throw new TaskAssigneeNotFoundError();
    }

    if (assignee.taskId !== taskId.value) {
      throw new TaskAssigneeTaskMismatchError();
    }

    await this.taskRepository.deleteTaskAssigneeById(assigneeId);

    return {
      message: 'Task assignee removed successfully.',
    };
  }
}

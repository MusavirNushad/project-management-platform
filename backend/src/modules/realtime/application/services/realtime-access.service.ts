import { Inject, Injectable } from '@nestjs/common';

import { AccessControlService } from '../../../access-control/application/services/access-control.service';

import {
  PROJECT_REPOSITORY,
  type ProjectRepositoryPort,
} from '../../../project/domain/ports/project.repository.port';
import { ProjectId } from '../../../project/domain/value-objects/project-id.vo';

import {
  TASK_REPOSITORY,
  type TaskRepositoryPort,
} from '../../../task/domain/ports/task.repository.port';
import { TaskId } from '../../../task/domain/value-objects/task-id.vo';

@Injectable()
export class RealtimeAccessService {
  constructor(
    private readonly accessControlService: AccessControlService,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
  ) {}

  async canJoinWorkspace(params: {
    userId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return this.accessControlService.canAccessWorkspace({
      workspaceId: params.workspaceId,
      userId: params.userId,
    });
  }

  async canJoinProject(params: {
    userId: string;
    projectId: string;
  }): Promise<boolean> {
    const project = await this.projectRepository.findById(
      ProjectId.create(params.projectId),
    );

    if (!project) {
      return false;
    }

    return this.accessControlService.canAccessProject({
      workspaceId: project.getWorkspaceId(),
      projectId: params.projectId,
      userId: params.userId,
    });
  }

  async canJoinTask(params: {
    userId: string;
    taskId: string;
  }): Promise<boolean> {
    const task = await this.taskRepository.findById(
      TaskId.create(params.taskId),
    );

    if (!task) {
      return false;
    }

    return this.accessControlService.canAccessProject({
      workspaceId: task.getWorkspaceId(),
      projectId: task.getProjectId(),
      userId: params.userId,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

import type {
  ProjectMemberDetailsForSprint,
  ProjectMemberRoleName,
  SprintRepositoryPort,
  SprintTaskDetails,
  SprintTaskReferenceDetails,
} from '../../domain/ports/sprint.repository.port';

import { SprintEntity } from '../../domain/entities/sprint.entity';
import { SprintTaskEntity } from '../../domain/entities/sprint-task.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { SprintId } from '../../domain/value-objects/sprint-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';
import { SprintTaskId } from '../../domain/value-objects/sprint-task-id.vo';

import { SprintMapper } from '../mappers/sprint.mapper';
import { SprintTaskMapper } from '../mappers/sprint-task.mapper';

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

type PrismaSprintTaskWithTask = Prisma.SprintTaskGetPayload<{
  include: {
    task: {
      select: {
        id: true;
        title: true;
        status: true;
        priority: true;
      };
    };
  };
}>;

@Injectable()
export class PrismaSprintRepository implements SprintRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(sprint: SprintEntity): Promise<SprintEntity> {
    const savedSprint = await this.prisma.sprint.upsert({
      where: {
        id: sprint.getId(),
      },
      create: SprintMapper.toPrismaCreate(sprint),
      update: SprintMapper.toPrismaUpdate(sprint),
    });

    return SprintMapper.toDomain(savedSprint);
  }

  async findById(sprintId: SprintId): Promise<SprintEntity | null> {
    const sprint = await this.prisma.sprint.findUnique({
      where: {
        id: sprintId.value,
      },
    });

    return sprint ? SprintMapper.toDomain(sprint) : null;
  }

  async findByProjectAndId(
    projectId: ProjectId,
    sprintId: SprintId,
  ): Promise<SprintEntity | null> {
    const sprint = await this.prisma.sprint.findFirst({
      where: {
        id: sprintId.value,
        projectId: projectId.value,
      },
    });

    return sprint ? SprintMapper.toDomain(sprint) : null;
  }

  async findByProjectId(projectId: ProjectId): Promise<SprintEntity[]> {
    const sprints = await this.prisma.sprint.findMany({
      where: {
        projectId: projectId.value,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sprints.map((sprint) => SprintMapper.toDomain(sprint));
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
  ): Promise<ProjectMemberDetailsForSprint | null> {
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
      ? this.toProjectMemberDetailsForSprint(projectMember)
      : null;
  }

  async findTaskByProjectAndId(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    taskId: TaskId,
  ): Promise<SprintTaskReferenceDetails | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId.value,
        workspaceId: workspaceId.value,
        projectId: projectId.value,
      },
      select: {
        id: true,
        workspaceId: true,
        projectId: true,
        title: true,
        status: true,
        priority: true,
      },
    });

    if (!task) {
      return null;
    }

    return {
      id: task.id,
      workspaceId: task.workspaceId,
      projectId: task.projectId,
      title: task.title,
      status: task.status,
      priority: task.priority,
    };
  }

  async findActiveSprintTaskByTaskId(
    taskId: TaskId,
  ): Promise<SprintTaskDetails | null> {
    const sprintTask = await this.prisma.sprintTask.findFirst({
      where: {
        taskId: taskId.value,
        removedAt: null,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!sprintTask) {
      return null;
    }

    return this.toSprintTaskDetails(sprintTask);
  }

  async findActiveSprintTasksBySprintId(
    sprintId: SprintId,
  ): Promise<SprintTaskDetails[]> {
    const sprintTasks = await this.prisma.sprintTask.findMany({
      where: {
        sprintId: sprintId.value,
        removedAt: null,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: [
        {
          position: 'asc',
        },
        {
          addedAt: 'asc',
        },
      ],
    });

    return sprintTasks.map((sprintTask) =>
      this.toSprintTaskDetails(sprintTask),
    );
  }

  async findSprintTaskById(
    sprintTaskId: SprintTaskId,
  ): Promise<SprintTaskDetails | null> {
    const sprintTask = await this.prisma.sprintTask.findUnique({
      where: {
        id: sprintTaskId.value,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!sprintTask) {
      return null;
    }

    return this.toSprintTaskDetails(sprintTask);
  }

  async updateSprintTask(
    sprintTask: SprintTaskEntity,
  ): Promise<SprintTaskDetails> {
    const updatedSprintTask = await this.prisma.sprintTask.update({
      where: {
        id: sprintTask.getId(),
      },
      data: SprintTaskMapper.toPrismaUpdate(sprintTask),
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    return this.toSprintTaskDetails(updatedSprintTask);
  }

  async saveSprintTask(
    sprintTask: SprintTaskEntity,
  ): Promise<SprintTaskDetails> {
    const savedSprintTask = await this.prisma.sprintTask.create({
      data: SprintTaskMapper.toPrismaCreate(sprintTask),
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    return this.toSprintTaskDetails(savedSprintTask);
  }

  private toProjectMemberDetailsForSprint(
    projectMember: PrismaProjectMemberWithRole,
  ): ProjectMemberDetailsForSprint {
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

  private toSprintTaskDetails(
    sprintTask: PrismaSprintTaskWithTask,
  ): SprintTaskDetails {
    return {
      id: sprintTask.id,
      sprintId: sprintTask.sprintId,
      taskId: sprintTask.taskId,
      position: sprintTask.position,
      addedAt: sprintTask.addedAt,
      removedAt: sprintTask.removedAt,
      task: {
        id: sprintTask.task.id,
        title: sprintTask.task.title,
        status: sprintTask.task.status,
        priority: sprintTask.task.priority,
      },
    };
  }
}

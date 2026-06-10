import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

import type {
  ProjectMemberDetailsForWorklog,
  ProjectMemberRoleName,
  WorklogDetails,
  WorklogRepositoryPort,
  WorklogTaskDetails,
} from '../../domain/ports/worklog.repository.port';

import { WorklogEntity } from '../../domain/entities/worklog.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorklogId } from '../../domain/value-objects/worklog-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

import { WorklogMapper } from '../mappers/worklog.mapper';

type PrismaWorklogWithUser = Prisma.WorklogGetPayload<{
  include: {
    user: {
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
export class PrismaWorklogRepository implements WorklogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(worklog: WorklogEntity): Promise<WorklogDetails> {
    const savedWorklog = await this.prisma.worklog.create({
      data: WorklogMapper.toPrismaCreate(worklog),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.toWorklogDetails(savedWorklog);
  }

  async findById(worklogId: WorklogId): Promise<WorklogDetails | null> {
    const worklog = await this.prisma.worklog.findUnique({
      where: {
        id: worklogId.value,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return worklog ? this.toWorklogDetails(worklog) : null;
  }

  async findByTaskId(taskId: TaskId): Promise<WorklogDetails[]> {
    const worklogs = await this.prisma.worklog.findMany({
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
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return worklogs.map((worklog) => this.toWorklogDetails(worklog));
  }

  async update(worklog: WorklogEntity): Promise<WorklogDetails> {
    const updatedWorklog = await this.prisma.worklog.update({
      where: {
        id: worklog.getId(),
      },
      data: WorklogMapper.toPrismaUpdate(worklog),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return this.toWorklogDetails(updatedWorklog);
  }

  async deleteById(worklogId: WorklogId): Promise<void> {
    await this.prisma.worklog.delete({
      where: {
        id: worklogId.value,
      },
    });
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

  async findTaskByProjectAndId(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    taskId: TaskId,
  ): Promise<WorklogTaskDetails | null> {
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
  ): Promise<ProjectMemberDetailsForWorklog | null> {
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
      ? this.toProjectMemberDetailsForWorklog(projectMember)
      : null;
  }

  private toWorklogDetails(worklog: PrismaWorklogWithUser): WorklogDetails {
    return {
      id: worklog.id,
      userId: worklog.userId,
      projectId: worklog.projectId,
      taskId: worklog.taskId,
      startedAt: worklog.startedAt,
      endedAt: worklog.endedAt,
      durationMin: worklog.durationMin,
      description: worklog.description,
      createdAt: worklog.createdAt,
      user: {
        id: worklog.user.id,
        name: worklog.user.name,
        email: worklog.user.email,
      },
    };
  }

  private toProjectMemberDetailsForWorklog(
    projectMember: PrismaProjectMemberWithRole,
  ): ProjectMemberDetailsForWorklog {
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
}

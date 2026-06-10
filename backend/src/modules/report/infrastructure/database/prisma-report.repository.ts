import { Injectable } from '@nestjs/common';
import { Prisma, Report as PrismaReport } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

import type {
  ProjectMemberDetailsForReport,
  ProjectMemberRoleName,
  ReportDetails,
  ReportRepositoryPort,
  ReportSummary,
} from '../../domain/ports/report.repository.port';

import { ReportEntity } from '../../domain/entities/report.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ReportId } from '../../domain/value-objects/report-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

import { ReportMapper } from '../mappers/report.mapper';

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
export class PrismaReportRepository implements ReportRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(report: ReportEntity): Promise<ReportDetails> {
    const savedReport = await this.prisma.report.create({
      data: ReportMapper.toPrismaCreate(report),
    });

    return this.toReportDetails(savedReport);
  }

  async findById(reportId: ReportId): Promise<ReportDetails | null> {
    const report = await this.prisma.report.findUnique({
      where: {
        id: reportId.value,
      },
    });

    return report ? this.toReportDetails(report) : null;
  }

  async findByProjectId(projectId: ProjectId): Promise<ReportDetails[]> {
    const reports = await this.prisma.report.findMany({
      where: {
        projectId: projectId.value,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports.map((report) => this.toReportDetails(report));
  }

  async update(report: ReportEntity): Promise<ReportDetails> {
    const updatedReport = await this.prisma.report.update({
      where: {
        id: report.getId(),
      },
      data: ReportMapper.toPrismaUpdate(report),
    });

    return this.toReportDetails(updatedReport);
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
  ): Promise<ProjectMemberDetailsForReport | null> {
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
      ? this.toProjectMemberDetailsForReport(projectMember)
      : null;
  }

  async getProjectReportSummary(input: {
    projectId: ProjectId;
    startDate: Date | null;
    endDate: Date | null;
  }): Promise<ReportSummary> {
    const dateFilter = this.buildDateFilter(input.startDate, input.endDate);

    const taskWhere: Prisma.TaskWhereInput = {
      projectId: input.projectId.value,
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };

    const sprintWhere: Prisma.SprintWhereInput = {
      projectId: input.projectId.value,
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };

    const worklogWhere: Prisma.WorklogWhereInput = {
      projectId: input.projectId.value,
      ...(dateFilter ? { startedAt: dateFilter } : {}),
    };

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks,
      doneTasks,
      cancelledTasks,

      lowPriorityTasks,
      mediumPriorityTasks,
      highPriorityTasks,

      totalSprints,
      plannedSprints,
      activeSprints,
      completedSprints,
      cancelledSprints,

      worklogDuration,
    ] = await Promise.all([
      this.prisma.task.count({
        where: taskWhere,
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          status: 'TODO',
        },
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          status: 'IN_PROGRESS',
        },
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          status: 'IN_REVIEW',
        },
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          status: 'DONE',
        },
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          status: 'CANCELLED',
        },
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          priority: 'LOW',
        },
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          priority: 'MEDIUM',
        },
      }),

      this.prisma.task.count({
        where: {
          ...taskWhere,
          priority: 'HIGH',
        },
      }),

      this.prisma.sprint.count({
        where: sprintWhere,
      }),

      this.prisma.sprint.count({
        where: {
          ...sprintWhere,
          status: 'PLANNED',
        },
      }),

      this.prisma.sprint.count({
        where: {
          ...sprintWhere,
          status: 'ACTIVE',
        },
      }),

      this.prisma.sprint.count({
        where: {
          ...sprintWhere,
          status: 'COMPLETED',
        },
      }),

      this.prisma.sprint.count({
        where: {
          ...sprintWhere,
          status: 'CANCELLED',
        },
      }),

      this.prisma.worklog.aggregate({
        where: worklogWhere,
        _sum: {
          durationMin: true,
        },
      }),
    ]);

    const totalWorklogMinutes = worklogDuration._sum.durationMin ?? 0;

    return {
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        inReview: inReviewTasks,
        done: doneTasks,
        cancelled: cancelledTasks,
      },
      priorities: {
        low: lowPriorityTasks,
        medium: mediumPriorityTasks,
        high: highPriorityTasks,
      },
      sprints: {
        total: totalSprints,
        planned: plannedSprints,
        active: activeSprints,
        completed: completedSprints,
        cancelled: cancelledSprints,
      },
      worklogs: {
        totalMinutes: totalWorklogMinutes,
        totalHours: Number((totalWorklogMinutes / 60).toFixed(2)),
      },
    };
  }

  private toReportDetails(report: PrismaReport): ReportDetails {
    return {
      id: report.id,
      projectId: report.projectId,
      createdBy: report.createdById,
      name: report.name,
      file: report.file,
      status: report.status,
      startDate: report.startDate,
      endDate: report.endDate,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }

  private toProjectMemberDetailsForReport(
    projectMember: PrismaProjectMemberWithRole,
  ): ProjectMemberDetailsForReport {
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

  private buildDateFilter(
    startDate: Date | null,
    endDate: Date | null,
  ): Prisma.DateTimeFilter | undefined {
    if (startDate === null && endDate === null) {
      return undefined;
    }

    const filter: Prisma.DateTimeFilter = {};

    if (startDate !== null) {
      filter.gte = this.toStartOfDay(startDate);
    }

    if (endDate !== null) {
      filter.lte = this.toEndOfDay(endDate);
    }

    return filter;
  }

  private toStartOfDay(date: Date): Date {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return startOfDay;
  }

  private toEndOfDay(date: Date): Date {
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return endOfDay;
  }
}

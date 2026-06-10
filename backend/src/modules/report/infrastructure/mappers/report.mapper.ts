import { Prisma, Report as PrismaReport } from '@prisma/client';

import {
  ReportEntity,
  ReportStatus,
} from '../../domain/entities/report.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ReportFile } from '../../domain/value-objects/report-file.vo';
import { ReportId } from '../../domain/value-objects/report-id.vo';
import { ReportName } from '../../domain/value-objects/report-name.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

export class ReportMapper {
  static toDomain(report: PrismaReport): ReportEntity {
    return ReportEntity.restore({
      id: ReportId.create(report.id),
      projectId: ProjectId.create(report.projectId),
      createdBy: UserId.create(report.createdById),
      name: ReportName.create(report.name),
      file: ReportFile.create(report.file),
      status: report.status,
      startDate: report.startDate,
      endDate: report.endDate,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    });
  }

  static toPrismaCreate(
    report: ReportEntity,
  ): Prisma.ReportUncheckedCreateInput {
    return {
      id: report.getId(),
      projectId: report.getProjectId(),
      createdById: report.getCreatedBy(),
      name: report.getName(),
      file: report.getFile(),
      status: report.getStatus(),
      startDate: report.getStartDate(),
      endDate: report.getEndDate(),
      createdAt: report.getCreatedAt(),
      updatedAt: report.getUpdatedAt(),
    };
  }

  static toPrismaUpdate(
    report: ReportEntity,
  ): Prisma.ReportUncheckedUpdateInput {
    return {
      name: report.getName(),
      file: report.getFile(),
      status: report.getStatus(),
      startDate: report.getStartDate(),
      endDate: report.getEndDate(),
      updatedAt: report.getUpdatedAt(),
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { ReportPermissionService } from '../permissions/report-permission.service';
import {
  GenerateReportSummaryService,
  GenerateReportSummaryResult,
} from './generate-report-summary.service';

import { REPORT_REPOSITORY } from '../../../domain/ports/report.repository.port';
import type {
  ReportDetails,
  ReportRepositoryPort,
} from '../../../domain/ports/report.repository.port';

import {
  ReportNotFoundError,
  ReportProjectAccessDeniedError,
  ReportProjectMismatchError,
  ReportProjectNotFoundError,
  ReportWorkspaceNotFoundError,
} from '../../../domain/errors/report-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ReportId } from '../../../domain/value-objects/report-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type GetReportByIdInput = {
  workspaceId: string;
  projectId: string;
  reportId: string;
  userId: string;
};

export type GetReportByIdResult = {
  report: ReportDetails;
  summary: GenerateReportSummaryResult;
};

@Injectable()
export class GetReportByIdService {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: ReportRepositoryPort,
    private readonly reportPermissionService: ReportPermissionService,
    private readonly generateReportSummaryService: GenerateReportSummaryService,
  ) {}

  async execute(input: GetReportByIdInput): Promise<GetReportByIdResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const reportId = ReportId.create(input.reportId);
    const userId = UserId.create(input.userId);

    const workspaceExists =
      await this.reportRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new ReportWorkspaceNotFoundError();
    }

    const projectExists = await this.reportRepository.projectExistsInWorkspace(
      workspaceId,
      projectId,
    );

    if (!projectExists) {
      throw new ReportProjectNotFoundError();
    }

    const canViewReports = await this.reportPermissionService.canViewReports({
      workspaceId,
      projectId,
      userId,
    });

    if (!canViewReports) {
      throw new ReportProjectAccessDeniedError();
    }

    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new ReportNotFoundError();
    }

    if (report.projectId !== projectId.value) {
      throw new ReportProjectMismatchError();
    }

    const summary = await this.generateReportSummaryService.execute({
      projectId,
      startDate: report.startDate,
      endDate: report.endDate,
    });

    return {
      report,
      summary,
    };
  }
}

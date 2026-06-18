import { Inject, Injectable } from '@nestjs/common';

import { REPORT_REPOSITORY } from '../../../domain/ports/report.repository.port';
import type {
  ReportDetails,
  ReportRepositoryPort,
} from '../../../domain/ports/report.repository.port';

import {
  ReportProjectNotFoundError,
  ReportWorkspaceNotFoundError,
} from '../../../domain/errors/report-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type ReportListItemResult = ReportDetails;

export type GetProjectReportsInput = {
  workspaceId: string;
  projectId: string;
};

export type GetProjectReportsResult = {
  items: ReportListItemResult[];
  total: number;
};

@Injectable()
export class GetProjectReportsService {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: ReportRepositoryPort,
  ) { }

  async execute(
    input: GetProjectReportsInput,
  ): Promise<GetProjectReportsResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);

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

    const reports = await this.reportRepository.findByProjectId(projectId);

    return {
      items: reports,
      total: reports.length,
    };
  }
}
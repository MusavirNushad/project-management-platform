import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

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

import { ReportEntity } from '../../../domain/entities/report.entity';

import {
    InvalidReportDateRangeError,
    ReportProjectAccessDeniedError,
    ReportProjectNotFoundError,
    ReportWorkspaceNotFoundError,
} from '../../../domain/errors/report-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ReportId } from '../../../domain/value-objects/report-id.vo';
import { ReportName } from '../../../domain/value-objects/report-name.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type CreateReportInput = {
    workspaceId: string;
    projectId: string;
    userId: string;
    name: string;
    startDate?: string | null;
    endDate?: string | null;
};

export type CreateReportResult = {
    report: ReportDetails;
    summary: GenerateReportSummaryResult;
};

@Injectable()
export class CreateReportService {
    constructor(
        @Inject(REPORT_REPOSITORY)
        private readonly reportRepository: ReportRepositoryPort,
        private readonly reportPermissionService: ReportPermissionService,
        private readonly generateReportSummaryService: GenerateReportSummaryService,
    ) { }

    async execute(input: CreateReportInput): Promise<CreateReportResult> {
        const workspaceId = WorkspaceId.create(input.workspaceId);
        const projectId = ProjectId.create(input.projectId);
        const userId = UserId.create(input.userId);

        const startDate = this.parseOptionalDate(input.startDate);
        const endDate = this.parseOptionalDate(input.endDate);

        const workspaceExists =
            await this.reportRepository.workspaceExists(workspaceId);

        if (!workspaceExists) {
            throw new ReportWorkspaceNotFoundError();
        }

        const projectExists =
            await this.reportRepository.projectExistsInWorkspace(
                workspaceId,
                projectId,
            );

        if (!projectExists) {
            throw new ReportProjectNotFoundError();
        }

        const canCreateReport =
            await this.reportPermissionService.canCreateReport({
                workspaceId,
                projectId,
                userId,
            });

        if (!canCreateReport) {
            throw new ReportProjectAccessDeniedError();
        }

        const report = ReportEntity.create({
            id: ReportId.create(randomUUID()),
            projectId,
            createdBy: userId,
            name: ReportName.create(input.name),
            startDate,
            endDate,
        });

        const savedReport = await this.reportRepository.save(report);

        const summary = await this.generateReportSummaryService.execute({
            projectId,
            startDate,
            endDate,
        });

        return {
            report: savedReport,
            summary,
        };
    }

    private parseOptionalDate(value?: string | null): Date | null {
        if (value === undefined || value === null) {
            return null;
        }

        const normalizedValue = value.trim();

        if (normalizedValue.length === 0) {
            return null;
        }

        const date = new Date(normalizedValue);

        if (Number.isNaN(date.getTime())) {
            throw new InvalidReportDateRangeError();
        }

        return date;
    }
}
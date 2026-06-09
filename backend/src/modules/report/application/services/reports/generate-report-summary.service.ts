import { Inject, Injectable } from '@nestjs/common';

import { REPORT_REPOSITORY } from '../../../domain/ports/report.repository.port';
import type {
    ReportRepositoryPort,
    ReportSummary,
} from '../../../domain/ports/report.repository.port';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';

export type GenerateReportSummaryInput = {
    projectId: ProjectId;
    startDate: Date | null;
    endDate: Date | null;
};

export type GenerateReportSummaryResult = ReportSummary;

@Injectable()
export class GenerateReportSummaryService {
    constructor(
        @Inject(REPORT_REPOSITORY)
        private readonly reportRepository: ReportRepositoryPort,
    ) { }

    async execute(
        input: GenerateReportSummaryInput,
    ): Promise<GenerateReportSummaryResult> {
        return this.reportRepository.getProjectReportSummary({
            projectId: input.projectId,
            startDate: input.startDate,
            endDate: input.endDate,
        });
    }
}
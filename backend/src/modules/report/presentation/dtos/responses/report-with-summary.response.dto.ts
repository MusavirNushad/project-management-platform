import type { CreateReportResult } from '../../../application/services/reports/create-report.service';
import type { GetReportByIdResult } from '../../../application/services/reports/get-report-by-id.service';

type ReportWithSummaryServiceResult = CreateReportResult | GetReportByIdResult;

export class ReportResponseDto {
    id!: string;
    projectId!: string;
    createdBy!: string;
    name!: string;
    file!: string | null;
    status!: string;
    startDate!: Date | null;
    endDate!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;
}

export class ReportTaskStatusSummaryResponseDto {
    total!: number;
    todo!: number;
    inProgress!: number;
    inReview!: number;
    done!: number;
    cancelled!: number;
}

export class ReportTaskPrioritySummaryResponseDto {
    low!: number;
    medium!: number;
    high!: number;
}

export class ReportSprintSummaryResponseDto {
    total!: number;
    planned!: number;
    active!: number;
    completed!: number;
    cancelled!: number;
}

export class ReportWorklogSummaryResponseDto {
    totalMinutes!: number;
    totalHours!: number;
}

export class ReportSummaryResponseDto {
    tasks!: ReportTaskStatusSummaryResponseDto;
    priorities!: ReportTaskPrioritySummaryResponseDto;
    sprints!: ReportSprintSummaryResponseDto;
    worklogs!: ReportWorklogSummaryResponseDto;
}

export class ReportWithSummaryResponseDto {
    report!: ReportResponseDto;
    summary!: ReportSummaryResponseDto;

    static fromResult(
        result: ReportWithSummaryServiceResult,
    ): ReportWithSummaryResponseDto {
        return {
            report: {
                id: result.report.id,
                projectId: result.report.projectId,
                createdBy: result.report.createdBy,
                name: result.report.name,
                file: result.report.file,
                status: result.report.status,
                startDate: result.report.startDate,
                endDate: result.report.endDate,
                createdAt: result.report.createdAt,
                updatedAt: result.report.updatedAt,
            },
            summary: {
                tasks: {
                    total: result.summary.tasks.total,
                    todo: result.summary.tasks.todo,
                    inProgress: result.summary.tasks.inProgress,
                    inReview: result.summary.tasks.inReview,
                    done: result.summary.tasks.done,
                    cancelled: result.summary.tasks.cancelled,
                },
                priorities: {
                    low: result.summary.priorities.low,
                    medium: result.summary.priorities.medium,
                    high: result.summary.priorities.high,
                },
                sprints: {
                    total: result.summary.sprints.total,
                    planned: result.summary.sprints.planned,
                    active: result.summary.sprints.active,
                    completed: result.summary.sprints.completed,
                    cancelled: result.summary.sprints.cancelled,
                },
                worklogs: {
                    totalMinutes: result.summary.worklogs.totalMinutes,
                    totalHours: result.summary.worklogs.totalHours,
                },
            },
        };
    }
}
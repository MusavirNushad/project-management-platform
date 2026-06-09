import { ReportEntity, ReportStatus } from '../entities/report.entity';

import { ProjectId } from '../value-objects/project-id.vo';
import { ReportId } from '../value-objects/report-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';

export const REPORT_REPOSITORY = Symbol('REPORT_REPOSITORY');

export type ProjectMemberRoleName = 'OWNER' | 'ADMIN' | 'MEMBER';

export type ProjectMemberDetailsForReport = {
    id: string;
    projectId: string;
    userId: string;
    role: {
        id: string;
        name: ProjectMemberRoleName;
    };
};

export type ReportDetails = {
    id: string;
    projectId: string;
    createdBy: string;
    name: string;
    file: string | null;
    status: ReportStatus;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ReportTaskStatusSummary = {
    total: number;
    todo: number;
    inProgress: number;
    inReview: number;
    done: number;
    cancelled: number;
};

export type ReportTaskPrioritySummary = {
    low: number;
    medium: number;
    high: number;
};

export type ReportSprintSummary = {
    total: number;
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
};

export type ReportWorklogSummary = {
    totalMinutes: number;
    totalHours: number;
};

export type ReportSummary = {
    tasks: ReportTaskStatusSummary;
    priorities: ReportTaskPrioritySummary;
    sprints: ReportSprintSummary;
    worklogs: ReportWorklogSummary;
};

export interface ReportRepositoryPort {
    save(report: ReportEntity): Promise<ReportDetails>;

    findById(reportId: ReportId): Promise<ReportDetails | null>;

    findByProjectId(projectId: ProjectId): Promise<ReportDetails[]>;

    update(report: ReportEntity): Promise<ReportDetails>;

    workspaceExists(workspaceId: WorkspaceId): Promise<boolean>;

    projectExistsInWorkspace(
        workspaceId: WorkspaceId,
        projectId: ProjectId,
    ): Promise<boolean>;

    isWorkspaceOwner(
        workspaceId: WorkspaceId,
        userId: UserId,
    ): Promise<boolean>;

    isProjectMember(
        projectId: ProjectId,
        userId: UserId,
    ): Promise<boolean>;

    findProjectMemberByProjectAndUser(
        projectId: ProjectId,
        userId: UserId,
    ): Promise<ProjectMemberDetailsForReport | null>;

    getProjectReportSummary(input: {
        projectId: ProjectId;
        startDate: Date | null;
        endDate: Date | null;
    }): Promise<ReportSummary>;
}
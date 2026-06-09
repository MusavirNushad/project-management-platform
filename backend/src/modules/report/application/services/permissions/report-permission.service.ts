import { Inject, Injectable } from '@nestjs/common';

import { REPORT_REPOSITORY } from '../../../domain/ports/report.repository.port';
import type { ReportRepositoryPort } from '../../../domain/ports/report.repository.port';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

type CanCreateReportInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};

type CanViewReportsInput = {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
    userId: UserId;
};



@Injectable()
export class ReportPermissionService {
    constructor(
        @Inject(REPORT_REPOSITORY)
        private readonly reportRepository: ReportRepositoryPort,
    ) { }

    async canCreateReport(input: CanCreateReportInput): Promise<boolean> {
        const isWorkspaceOwner = await this.reportRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        const projectMember =
            await this.reportRepository.findProjectMemberByProjectAndUser(
                input.projectId,
                input.userId,
            );

        return projectMember?.role.name === 'ADMIN';
    }


    async canViewReports(input: CanViewReportsInput): Promise<boolean> {
        const isWorkspaceOwner = await this.reportRepository.isWorkspaceOwner(
            input.workspaceId,
            input.userId,
        );

        if (isWorkspaceOwner) {
            return true;
        }

        return this.reportRepository.isProjectMember(
            input.projectId,
            input.userId,
        );
    }
}
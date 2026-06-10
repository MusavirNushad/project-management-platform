import { Injectable } from '@nestjs/common';

import { AccessControlService } from '../../../../access-control/application/services/access-control.service';

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
  constructor(private readonly accessControlService: AccessControlService) {}

  async canCreateReport(input: CanCreateReportInput): Promise<boolean> {
    return this.accessControlService.canManageProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canViewReports(input: CanViewReportsInput): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }
}

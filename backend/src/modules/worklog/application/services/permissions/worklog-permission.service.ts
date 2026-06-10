import { Injectable } from '@nestjs/common';

import { AccessControlService } from '../../../../access-control/application/services/access-control.service';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

type CanCreateWorklogInput = {
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  userId: UserId;
};

type CanViewTaskWorklogsInput = {
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  userId: UserId;
};

type CanUpdateWorklogInput = {
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  userId: UserId;
  worklogUserId: UserId;
};

type CanDeleteWorklogInput = {
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  userId: UserId;
  worklogUserId: UserId;
};

@Injectable()
export class WorklogPermissionService {
  constructor(private readonly accessControlService: AccessControlService) {}

  async canCreateWorklog(input: CanCreateWorklogInput): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canViewTaskWorklogs(input: CanViewTaskWorklogsInput): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canUpdateWorklog(input: CanUpdateWorklogInput): Promise<boolean> {
    if (input.userId.equals(input.worklogUserId)) {
      return true;
    }

    return this.accessControlService.canManageProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canDeleteWorklog(input: CanDeleteWorklogInput): Promise<boolean> {
    if (input.userId.equals(input.worklogUserId)) {
      return true;
    }

    return this.accessControlService.canManageProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }
}

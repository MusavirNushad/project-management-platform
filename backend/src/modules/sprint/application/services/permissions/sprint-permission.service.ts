import { Injectable } from '@nestjs/common';

import { AccessControlService } from '../../../../access-control/application/services/access-control.service';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

type CanManageSprintsInput = {
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  userId: UserId;
};

type CanViewSprintsInput = {
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  userId: UserId;
};

@Injectable()
export class SprintPermissionService {
  constructor(private readonly accessControlService: AccessControlService) {}

  async canManageSprints(input: CanManageSprintsInput): Promise<boolean> {
    return this.accessControlService.canManageProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }

  async canViewSprints(input: CanViewSprintsInput): Promise<boolean> {
    return this.accessControlService.canAccessProject({
      workspaceId: input.workspaceId.value,
      projectId: input.projectId.value,
      userId: input.userId.value,
    });
  }
}

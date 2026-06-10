import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type { ProjectRepositoryPort } from '../../../domain/ports/project.repository.port';

import {
  ProjectCreatorCannotBeRemovedError,
  ProjectMemberNotFoundError,
  ProjectMemberProjectMismatchError,
  ProjectNotFoundError,
  ProjectWorkspaceAccessDeniedError,
  ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ProjectMemberId } from '../../../domain/value-objects/project-member-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

import { ProjectMemberPermissionService } from './project-member-permission.service';

export type RemoveProjectMemberInput = {
  workspaceId: string;
  projectId: string;
  memberId: string;
  actorUserId: string;
};

export type RemoveProjectMemberResult = {
  message: string;
};

@Injectable()
export class RemoveProjectMemberService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
    private readonly projectMemberPermissionService: ProjectMemberPermissionService,
  ) {}

  async execute(
    input: RemoveProjectMemberInput,
  ): Promise<RemoveProjectMemberResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const memberId = ProjectMemberId.create(input.memberId);
    const actorUserId = UserId.create(input.actorUserId);

    const workspaceExists =
      await this.projectRepository.workspaceExists(workspaceId);

    if (!workspaceExists) {
      throw new ProjectWorkspaceNotFoundError();
    }

    const project = await this.projectRepository.findByWorkspaceAndId(
      workspaceId,
      projectId,
    );

    if (!project) {
      throw new ProjectNotFoundError();
    }

    const canManageProjectMembers =
      await this.projectMemberPermissionService.canManageProjectMembers({
        workspaceId,
        projectId,
        actorUserId,
      });

    if (!canManageProjectMembers) {
      throw new ProjectWorkspaceAccessDeniedError();
    }

    const member =
      await this.projectRepository.findProjectMemberDetailsById(memberId);

    if (!member) {
      throw new ProjectMemberNotFoundError();
    }

    if (member.projectId !== projectId.value) {
      throw new ProjectMemberProjectMismatchError();
    }

    if (member.userId === project.getCreatedBy()) {
      throw new ProjectCreatorCannotBeRemovedError();
    }

    await this.projectRepository.deleteProjectMemberById(memberId);

    return {
      message: 'Project member removed successfully.',
    };
  }
}

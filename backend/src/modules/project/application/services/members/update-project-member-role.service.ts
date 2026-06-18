import { Inject, Injectable } from '@nestjs/common';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type {
  ProjectAssignableRoleName,
  ProjectMemberDetails,
  ProjectRepositoryPort,
} from '../../../domain/ports/project.repository.port';

import {
  ProjectMemberNotFoundError,
  ProjectMemberProjectMismatchError,
  ProjectNotFoundError,
  ProjectRoleNotFoundError,
  ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ProjectMemberId } from '../../../domain/value-objects/project-member-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type UpdateProjectMemberRoleInput = {
  workspaceId: string;
  projectId: string;
  memberId: string;
  roleName: ProjectAssignableRoleName;
};

export type UpdateProjectMemberRoleResult = ProjectMemberDetails;

@Injectable()
export class UpdateProjectMemberRoleService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
  ) { }

  async execute(
    input: UpdateProjectMemberRoleInput,
  ): Promise<UpdateProjectMemberRoleResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
    const memberId = ProjectMemberId.create(input.memberId);

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

    const member =
      await this.projectRepository.findProjectMemberDetailsById(memberId);

    if (!member) {
      throw new ProjectMemberNotFoundError();
    }

    if (member.projectId !== projectId.value) {
      throw new ProjectMemberProjectMismatchError();
    }

    const roleId = await this.projectRepository.findRoleIdByName(
      input.roleName,
    );

    if (!roleId) {
      throw new ProjectRoleNotFoundError();
    }

    return this.projectRepository.updateProjectMemberRoleById(memberId, roleId);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ProjectRealtimeEventsService } from '../realtime/project-realtime-events.service';

import { PROJECT_REPOSITORY } from '../../../domain/ports/project.repository.port';
import type {
  ProjectAssignableRoleName,
  ProjectMemberDetails,
  ProjectRepositoryPort,
} from '../../../domain/ports/project.repository.port';

import { ProjectMemberEntity } from '../../../domain/entities/project-member.entity';

import {
  ProjectMemberAlreadyExistsError,
  ProjectMemberNotFoundError,
  ProjectMemberUserNotFoundError,
  ProjectNotFoundError,
  ProjectRoleNotFoundError,
  ProjectWorkspaceAccessDeniedError,
  ProjectWorkspaceNotFoundError,
} from '../../../domain/errors/project-domain.errors';

import { ProjectId } from '../../../domain/value-objects/project-id.vo';
import { ProjectMemberId } from '../../../domain/value-objects/project-member-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

import { ProjectMemberPermissionService } from './project-member-permission.service';

export type AddProjectMemberInput = {
  workspaceId: string;
  projectId: string;
  actorUserId: string;
  email: string;
  roleName: ProjectAssignableRoleName;
};

export type AddProjectMemberResult = ProjectMemberDetails;

@Injectable()
export class AddProjectMemberService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
    private readonly projectMemberPermissionService: ProjectMemberPermissionService,
    private readonly projectRealtimeEventsService: ProjectRealtimeEventsService,
  ) { }

  async execute(input: AddProjectMemberInput): Promise<AddProjectMemberResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const projectId = ProjectId.create(input.projectId);
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

    const targetUser = await this.projectRepository.findUserByEmail(
      input.email,
    );

    if (!targetUser) {
      throw new ProjectMemberUserNotFoundError();
    }

    const targetUserId = UserId.create(targetUser.id);

    const isWorkspaceMember = await this.projectRepository.isWorkspaceMember(
      workspaceId,
      targetUserId,
    );

    if (!isWorkspaceMember) {
      throw new ProjectWorkspaceAccessDeniedError();
    }

    const existingMember =
      await this.projectRepository.findProjectMemberDetailsByProjectAndUser(
        projectId,
        targetUserId,
      );

    if (existingMember) {
      throw new ProjectMemberAlreadyExistsError();
    }

    const roleId = await this.projectRepository.findRoleIdByName(
      input.roleName,
    );

    if (!roleId) {
      throw new ProjectRoleNotFoundError();
    }

    const member = ProjectMemberEntity.create({
      id: ProjectMemberId.create(randomUUID()),
      projectId,
      userId: targetUserId,
      roleId,
    });

    project.addMember(member);

    await this.projectRepository.save(project);

    const createdMember =
      await this.projectRepository.findProjectMemberDetailsByProjectAndUser(
        projectId,
        targetUserId,
      );

    if (!createdMember) {
      throw new ProjectMemberNotFoundError();
    }

    this.projectRealtimeEventsService.emitProjectMemberAdded({
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      memberId: targetUser.id,
      roleName: createdMember.role.name,
      addedBy: {
        userId: input.actorUserId,
      },
      addedAt: new Date().toISOString(),
    });

    return createdMember;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { WorkspaceRealtimeEventsService } from '../workspace-realtime/workspace-realtime-events.service';

import { WORKSPACE_REPOSITORY } from '../../../domain/ports/workspace.repository.port';
import type {
  WorkspaceAssignableRoleName,
  WorkspaceMemberDetails,
  WorkspaceRepositoryPort,
} from '../../../domain/ports/workspace.repository.port';

import { WorkspaceMemberEntity } from '../../../domain/entities/workspace-member.entity';

import {
  WorkspaceAccessDeniedError,
  WorkspaceMemberAlreadyExistsError,
  WorkspaceMemberNotFoundError,
  WorkspaceMemberUserNotFoundError,
  WorkspaceNotFoundError,
  WorkspaceRoleNotFoundError,
} from '../../../domain/errors/workspace-domain.errors';

import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';
import { WorkspaceMemberId } from '../../../domain/value-objects/workspace-member-id.vo';

export type AddWorkspaceMemberInput = {
  workspaceId: string;
  actorUserId: string;
  email: string;
  roleName: WorkspaceAssignableRoleName;
};

export type AddWorkspaceMemberResult = WorkspaceMemberDetails;

@Injectable()
export class AddWorkspaceMemberService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepositoryPort,
    private readonly workspaceRealtimeEventsService: WorkspaceRealtimeEventsService,
  ) { }

  async execute(
    input: AddWorkspaceMemberInput,
  ): Promise<AddWorkspaceMemberResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const actorUserId = UserId.create(input.actorUserId);

    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    if (!workspace.isOwnedBy(actorUserId)) {
      throw new WorkspaceAccessDeniedError();
    }

    const targetUser = await this.workspaceRepository.findUserByEmail(
      input.email,
    );

    if (!targetUser) {
      throw new WorkspaceMemberUserNotFoundError();
    }

    const targetUserId = UserId.create(targetUser.id);

    if (workspace.hasMember(targetUserId)) {
      throw new WorkspaceMemberAlreadyExistsError();
    }

    const roleId = await this.workspaceRepository.findRoleIdByName(
      input.roleName,
    );

    if (!roleId) {
      throw new WorkspaceRoleNotFoundError();
    }

    const member = WorkspaceMemberEntity.create({
      id: WorkspaceMemberId.create(randomUUID()),
      workspaceId,
      userId: targetUserId,
      roleId,
    });

    workspace.addMember(member);

    await this.workspaceRepository.save(workspace);

    const createdMember =
      await this.workspaceRepository.findMemberDetailsByWorkspaceAndUser(
        workspaceId,
        targetUserId,
      );

    if (!createdMember) {
      throw new WorkspaceMemberNotFoundError();
    }

    this.workspaceRealtimeEventsService.emitWorkspaceMemberAdded({
      workspaceId: input.workspaceId,
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

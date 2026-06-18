import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceRealtimeEventsService } from '../workspace-realtime/workspace-realtime-events.service';

import { WORKSPACE_REPOSITORY } from '../../../domain/ports/workspace.repository.port';
import type { WorkspaceRepositoryPort } from '../../../domain/ports/workspace.repository.port';

import {
  WorkspaceMemberNotFoundError,
  WorkspaceMemberWorkspaceMismatchError,
  WorkspaceNotFoundError,
  WorkspaceOwnerCannotBeRemovedError,
} from '../../../domain/errors/workspace-domain.errors';

import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';
import { WorkspaceMemberId } from '../../../domain/value-objects/workspace-member-id.vo';

export type RemoveWorkspaceMemberInput = {
  workspaceId: string;
  actorUserId: string;
  memberId: string;
};

export type RemoveWorkspaceMemberResult = {
  message: string;
};

@Injectable()
export class RemoveWorkspaceMemberService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepositoryPort,
    private readonly workspaceRealtimeEventsService: WorkspaceRealtimeEventsService,
  ) { }

  async execute(
    input: RemoveWorkspaceMemberInput,
  ): Promise<RemoveWorkspaceMemberResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const actorUserId = UserId.create(input.actorUserId);
    const memberId = WorkspaceMemberId.create(input.memberId);

    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    const member =
      await this.workspaceRepository.findMemberDetailsById(memberId);

    if (!member) {
      throw new WorkspaceMemberNotFoundError();
    }

    if (member.workspaceId !== workspaceId.value) {
      throw new WorkspaceMemberWorkspaceMismatchError();
    }

    if (member.userId === workspace.getOwnerId()) {
      throw new WorkspaceOwnerCannotBeRemovedError();
    }

    await this.workspaceRepository.deleteMemberById(memberId);

    this.workspaceRealtimeEventsService.emitWorkspaceMemberRemoved({
      workspaceId: input.workspaceId,
      memberId: member.userId,
      removedBy: {
        userId: actorUserId.value,
      },
      removedAt: new Date().toISOString(),
    });

    return {
      message: 'Workspace member removed successfully.',
    };
  }
}
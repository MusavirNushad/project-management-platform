import { Inject, Injectable } from '@nestjs/common';

import { WORKSPACE_REPOSITORY } from '../../../domain/ports/workspace.repository.port';
import type {
  WorkspaceMemberDetails,
  WorkspaceRepositoryPort,
} from '../../../domain/ports/workspace.repository.port';

import {
  WorkspaceAccessDeniedError,
  WorkspaceNotFoundError,
} from '../../../domain/errors/workspace-domain.errors';

import { UserId } from '../../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../../domain/value-objects/workspace-id.vo';

export type WorkspaceMemberListItemResult = WorkspaceMemberDetails;

export type GetWorkspaceMembersInput = {
  workspaceId: string;
  userId: string;
};

export type GetWorkspaceMembersResult = {
  items: WorkspaceMemberListItemResult[];
  total: number;
};

@Injectable()
export class GetWorkspaceMembersService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepositoryPort,
  ) { }

  async execute(
    input: GetWorkspaceMembersInput,
  ): Promise<GetWorkspaceMembersResult> {
    const workspaceId = WorkspaceId.create(input.workspaceId);
    const userId = UserId.create(input.userId);

    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    if (!workspace.hasMember(userId)) {
      throw new WorkspaceAccessDeniedError();
    }

    const members =
      await this.workspaceRepository.findMembersByWorkspaceId(workspaceId);

    return {
      items: members,
      total: members.length,
    };
  }
}
import { Prisma } from '@prisma/client';

import { WorkspaceEntity } from '../../domain/entities/workspace.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceDescription } from '../../domain/value-objects/workspace-description.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';
import { WorkspaceName } from '../../domain/value-objects/workspace-name.vo';
import { WorkspaceSlug } from '../../domain/value-objects/workspace-slug.vo';
import { WorkspaceMemberMapper } from './workspace-member.mapper';

export type PrismaWorkspaceWithMembers = Prisma.WorkspaceGetPayload<{
  include: {
    members: true;
  };
}>;

export class WorkspaceMapper {
  static toDomain(workspace: PrismaWorkspaceWithMembers): WorkspaceEntity {
    return WorkspaceEntity.restore({
      id: WorkspaceId.create(workspace.id),
      ownerId: UserId.create(workspace.ownerId),
      name: WorkspaceName.create(workspace.name),
      slug: WorkspaceSlug.create(workspace.slug),
      description: WorkspaceDescription.create(workspace.description),
      members: workspace.members.map(WorkspaceMemberMapper.toDomain),
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    });
  }

  static toPrismaCreate(
    workspace: WorkspaceEntity,
  ): Prisma.WorkspaceUncheckedCreateInput {
    return {
      id: workspace.getId(),
      ownerId: workspace.getOwnerId(),
      name: workspace.getName(),
      slug: workspace.getSlug(),
      description: workspace.getDescription(),
      createdAt: workspace.getCreatedAt(),
      updatedAt: workspace.getUpdatedAt(),
    };
  }

  static toPrismaUpdate(
    workspace: WorkspaceEntity,
  ): Prisma.WorkspaceUncheckedUpdateInput {
    return {
      name: workspace.getName(),
      slug: workspace.getSlug(),
      description: workspace.getDescription(),
      updatedAt: workspace.getUpdatedAt(),
    };
  }
}

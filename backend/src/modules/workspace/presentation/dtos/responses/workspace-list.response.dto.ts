import type {
  GetMyWorkspacesResult,
  WorkspaceListItemResult,
} from '../../../application/services/workspaces/get-my-workspaces.service';

export class WorkspaceListItemResponseDto {
  id!: string;
  ownerId!: string;
  name!: string;
  slug!: string;
  description!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromResult(
    result: WorkspaceListItemResult,
  ): WorkspaceListItemResponseDto {
    return {
      id: result.id,
      ownerId: result.ownerId,
      name: result.name,
      slug: result.slug,
      description: result.description,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}

export class WorkspaceListResponseDto {
  items!: WorkspaceListItemResponseDto[];
  total!: number;

  static fromResult(result: GetMyWorkspacesResult): WorkspaceListResponseDto {
    return {
      items: result.items.map(WorkspaceListItemResponseDto.fromResult),
      total: result.total,
    };
  }
}

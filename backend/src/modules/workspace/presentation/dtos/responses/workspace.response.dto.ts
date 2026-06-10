import type { CreateWorkspaceResult } from '../../../application/services/workspaces/create-workspace.service';
import type { GetWorkspaceByIdResult } from '../../../application/services/workspaces/get-workspace-by-id.service';
import type { UpdateWorkspaceResult } from '../../../application/services/workspaces/update-workspace.service';

type WorkspaceServiceResult =
  | CreateWorkspaceResult
  | GetWorkspaceByIdResult
  | UpdateWorkspaceResult;

export class WorkspaceResponseDto {
  id!: string;
  ownerId!: string;
  name!: string;
  slug!: string;
  description!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromResult(result: WorkspaceServiceResult): WorkspaceResponseDto {
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

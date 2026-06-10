import type { CreateProjectResult } from '../../../application/services/projects/create-project.service';
import type { GetProjectByIdResult } from '../../../application/services/projects/get-project-by-id.service';
import type { UpdateProjectResult } from '../../../application/services/projects/update-project.service';

type ProjectServiceResult =
  | CreateProjectResult
  | GetProjectByIdResult
  | UpdateProjectResult;

export class ProjectResponseDto {
  id!: string;
  workspaceId!: string;
  createdBy!: string;
  title!: string;
  status!: string;
  description!: string | null;
  startDate!: Date | null;
  dueDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromResult(result: ProjectServiceResult): ProjectResponseDto {
    return {
      id: result.id,
      workspaceId: result.workspaceId,
      createdBy: result.createdBy,
      title: result.title,
      status: result.status,
      description: result.description,
      startDate: result.startDate,
      dueDate: result.dueDate,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}

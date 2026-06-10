import type {
  GetProjectSprintsResult,
  ProjectSprintListItemResult,
} from '../../../application/services/sprints/get-project-sprints.service';

export class SprintListItemResponseDto {
  id!: string;
  projectId!: string;
  createdBy!: string;
  name!: string;
  goal!: string | null;
  status!: string;
  startDate!: Date | null;
  endDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromResult(
    result: ProjectSprintListItemResult,
  ): SprintListItemResponseDto {
    return {
      id: result.id,
      projectId: result.projectId,
      createdBy: result.createdBy,
      name: result.name,
      goal: result.goal,
      status: result.status,
      startDate: result.startDate,
      endDate: result.endDate,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}

export class SprintListResponseDto {
  items!: SprintListItemResponseDto[];
  total!: number;

  static fromResult(result: GetProjectSprintsResult): SprintListResponseDto {
    return {
      items: result.items.map(SprintListItemResponseDto.fromResult),
      total: result.total,
    };
  }
}

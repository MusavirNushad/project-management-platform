import type {
  GetProjectReportsResult,
  ReportListItemResult,
} from '../../../application/services/reports/get-project-reports.service';

export class ReportListItemResponseDto {
  id!: string;
  projectId!: string;
  createdBy!: string;
  name!: string;
  file!: string | null;
  status!: string;
  startDate!: Date | null;
  endDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromResult(result: ReportListItemResult): ReportListItemResponseDto {
    return {
      id: result.id,
      projectId: result.projectId,
      createdBy: result.createdBy,
      name: result.name,
      file: result.file,
      status: result.status,
      startDate: result.startDate,
      endDate: result.endDate,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}

export class ReportListResponseDto {
  items!: ReportListItemResponseDto[];
  total!: number;

  static fromResult(result: GetProjectReportsResult): ReportListResponseDto {
    return {
      items: result.items.map((item) =>
        ReportListItemResponseDto.fromResult(item),
      ),
      total: result.total,
    };
  }
}

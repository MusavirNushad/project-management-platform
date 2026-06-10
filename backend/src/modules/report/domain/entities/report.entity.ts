import {
  InvalidReportDateRangeError,
  InvalidReportStatusError,
} from '../errors/report-domain.errors';

import { ProjectId } from '../value-objects/project-id.vo';
import { ReportFile } from '../value-objects/report-file.vo';
import { ReportId } from '../value-objects/report-id.vo';
import { ReportName } from '../value-objects/report-name.vo';
import { UserId } from '../value-objects/user-id.vo';

const statusGenerated = 'GENERATED';
const statusPending = 'PENDING';
const statusFailed = 'FAILED';

export type ReportStatus =
  | typeof statusPending
  | typeof statusGenerated
  | typeof statusFailed;

type ReportEntityProps = {
  id: ReportId;
  projectId: ProjectId;
  createdBy: UserId;
  name: ReportName;
  file: ReportFile;
  status: ReportStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreateReportProps = {
  id: ReportId;
  projectId: ProjectId;
  createdBy: UserId;
  name: ReportName;
  startDate?: Date | null;
  endDate?: Date | null;
};

type RestoreReportProps = {
  id: ReportId;
  projectId: ProjectId;
  createdBy: UserId;
  name: ReportName;
  file: ReportFile;
  status: ReportStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateReportDetailsInput = {
  name?: ReportName;
  startDate?: Date | null;
  endDate?: Date | null;
};

export class ReportEntity {
  private constructor(private readonly props: ReportEntityProps) {}

  static create(props: CreateReportProps): ReportEntity {
    const startDate = props.startDate ?? null;
    const endDate = props.endDate ?? null;

    ReportEntity.validateDateRange(startDate, endDate);

    const now = new Date();

    return new ReportEntity({
      id: props.id,
      projectId: props.projectId,
      createdBy: props.createdBy,
      name: props.name,
      file: ReportFile.create(null),
      status: statusGenerated,
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: RestoreReportProps): ReportEntity {
    ReportEntity.validateStatus(props.status);
    ReportEntity.validateDateRange(props.startDate, props.endDate);

    return new ReportEntity({
      id: props.id,
      projectId: props.projectId,
      createdBy: props.createdBy,
      name: props.name,
      file: props.file,
      status: props.status,
      startDate: props.startDate,
      endDate: props.endDate,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  updateDetails(input: UpdateReportDetailsInput): void {
    const startDate =
      input.startDate !== undefined ? input.startDate : this.props.startDate;

    const endDate =
      input.endDate !== undefined ? input.endDate : this.props.endDate;

    ReportEntity.validateDateRange(startDate, endDate);

    if (input.name !== undefined) {
      this.props.name = input.name;
    }

    this.props.startDate = startDate;
    this.props.endDate = endDate;
    this.touch();
  }

  markPending(): void {
    this.props.status = statusPending;
    this.touch();
  }

  markGenerated(file?: ReportFile | null): void {
    this.props.status = statusGenerated;

    if (file !== undefined && file !== null) {
      this.props.file = file;
    }

    this.touch();
  }

  markFailed(): void {
    this.props.status = statusFailed;
    this.touch();
  }

  clearFile(): void {
    this.props.file = ReportFile.create(null);
    this.touch();
  }

  belongsToProject(projectId: ProjectId): boolean {
    return this.props.projectId.equals(projectId);
  }

  isCreatedBy(userId: UserId): boolean {
    return this.props.createdBy.equals(userId);
  }

  getId(): string {
    return this.props.id.value;
  }

  getProjectId(): string {
    return this.props.projectId.value;
  }

  getCreatedBy(): string {
    return this.props.createdBy.value;
  }

  getName(): string {
    return this.props.name.value;
  }

  getFile(): string | null {
    return this.props.file.value;
  }

  getStatus(): ReportStatus {
    return this.props.status;
  }

  getStartDate(): Date | null {
    return this.props.startDate;
  }

  getEndDate(): Date | null {
    return this.props.endDate;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private static validateStatus(status: ReportStatus): void {
    const validStatuses: ReportStatus[] = [
      statusPending,
      statusGenerated,
      statusFailed,
    ];

    if (!validStatuses.includes(status)) {
      throw new InvalidReportStatusError();
    }
  }

  private static validateDateRange(
    startDate: Date | null,
    endDate: Date | null,
  ): void {
    if (startDate !== null && !this.isValidDate(startDate)) {
      throw new InvalidReportDateRangeError();
    }

    if (endDate !== null && !this.isValidDate(endDate)) {
      throw new InvalidReportDateRangeError();
    }

    if (startDate !== null && endDate !== null && startDate > endDate) {
      throw new InvalidReportDateRangeError();
    }
  }

  private static isValidDate(value: Date): boolean {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }
}

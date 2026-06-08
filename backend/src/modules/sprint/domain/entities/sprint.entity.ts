import {
    InvalidSprintDateRangeError,
    InvalidSprintStatusError,
} from '../errors/sprint-domain.errors';

import { ProjectId } from '../value-objects/project-id.vo';
import { SprintGoal } from '../value-objects/sprint-goal.vo';
import { SprintId } from '../value-objects/sprint-id.vo';
import { SprintName } from '../value-objects/sprint-name.vo';
import { UserId } from '../value-objects/user-id.vo';

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const SprintStatuses: SprintStatus[] = [
    'PLANNED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
];

type SprintEntityProps = {
    id: SprintId;
    projectId: ProjectId;
    createdBy: UserId;
    name: SprintName;
    goal: SprintGoal;
    status: SprintStatus;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type CreateSprintProps = {
    id: SprintId;
    projectId: ProjectId;
    createdBy: UserId;
    name: SprintName;
    goal: SprintGoal;
    status?: SprintStatus;
    startDate?: Date | null;
    endDate?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
};

type RestoreSprintProps = {
    id: SprintId;
    projectId: ProjectId;
    createdBy: UserId;
    name: SprintName;
    goal: SprintGoal;
    status: SprintStatus;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type UpdateSprintDetailsProps = {
    name?: SprintName;
    goal?: SprintGoal;
    startDate?: Date | null;
    endDate?: Date | null;
};

export class SprintEntity {
    private constructor(private readonly props: SprintEntityProps) { }

    static create(props: CreateSprintProps): SprintEntity {
        const now = new Date();
        const status = props.status ?? 'PLANNED';
        const startDate = props.startDate ?? null;
        const endDate = props.endDate ?? null;

        SprintEntity.validateStatus(status);
        SprintEntity.validateDateRange(startDate, endDate);

        return new SprintEntity({
            id: props.id,
            projectId: props.projectId,
            createdBy: props.createdBy,
            name: props.name,
            goal: props.goal,
            status,
            startDate,
            endDate,
            createdAt: props.createdAt ?? now,
            updatedAt: props.updatedAt ?? now,
        });
    }

    static restore(props: RestoreSprintProps): SprintEntity {
        SprintEntity.validateStatus(props.status);
        SprintEntity.validateDateRange(props.startDate, props.endDate);

        return new SprintEntity({
            id: props.id,
            projectId: props.projectId,
            createdBy: props.createdBy,
            name: props.name,
            goal: props.goal,
            status: props.status,
            startDate: props.startDate,
            endDate: props.endDate,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        });
    }

    updateDetails(props: UpdateSprintDetailsProps): void {
        const startDate =
            props.startDate !== undefined
                ? props.startDate
                : this.props.startDate;

        const endDate =
            props.endDate !== undefined
                ? props.endDate
                : this.props.endDate;

        SprintEntity.validateDateRange(startDate, endDate);

        if (props.name !== undefined) {
            this.props.name = props.name;
        }

        if (props.goal !== undefined) {
            this.props.goal = props.goal;
        }

        if (props.startDate !== undefined) {
            this.props.startDate = props.startDate;
        }

        if (props.endDate !== undefined) {
            this.props.endDate = props.endDate;
        }

        this.touch();
    }

    changeStatus(status: SprintStatus): void {
        SprintEntity.validateStatus(status);

        this.props.status = status;
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

    getGoal(): string | null {
        return this.props.goal.value;
    }

    getStatus(): SprintStatus {
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

    private static validateDateRange(
        startDate: Date | null,
        endDate: Date | null,
    ): void {
        if (startDate && endDate && startDate > endDate) {
            throw new InvalidSprintDateRangeError();
        }
    }

    private static validateStatus(status: SprintStatus): void {
        if (!SprintStatuses.includes(status)) {
            throw new InvalidSprintStatusError();
        }
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }
}

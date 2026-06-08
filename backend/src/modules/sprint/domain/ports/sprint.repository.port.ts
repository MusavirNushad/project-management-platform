import { SprintEntity } from '../entities/sprint.entity';

import { ProjectId } from '../value-objects/project-id.vo';
import { SprintId } from '../value-objects/sprint-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { WorkspaceId } from '../value-objects/workspace-id.vo';
import { SprintTaskId } from '../value-objects/sprint-task-id.vo';

import { TaskId } from '../value-objects/task-id.vo';
import { SprintTaskEntity } from '../entities/sprint-task.entity';

export const SPRINT_REPOSITORY = Symbol('SPRINT_REPOSITORY');

export type ProjectMemberRoleName = 'OWNER' | 'ADMIN' | 'MEMBER';

export type SprintTaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';

export type SprintTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type ProjectMemberDetailsForSprint = {
    id: string;
    projectId: string;
    userId: string;
    role: {
        id: string;
        name: ProjectMemberRoleName;
    };
};

export type SprintTaskReferenceDetails = {
    id: string;
    workspaceId: string;
    projectId: string;
    title: string;
    status: SprintTaskStatus;
    priority: SprintTaskPriority;
};

export type SprintTaskTaskDetails = {
    id: string;
    title: string;
    status: SprintTaskStatus;
    priority: SprintTaskPriority;
};

export type SprintTaskDetails = {
    id: string;
    sprintId: string;
    taskId: string;
    position: number | null;
    addedAt: Date;
    removedAt: Date | null;
    task: SprintTaskTaskDetails;
};

export interface SprintRepositoryPort {
    save(sprint: SprintEntity): Promise<SprintEntity>;

    findById(sprintId: SprintId): Promise<SprintEntity | null>;

    findByProjectAndId(
        projectId: ProjectId,
        sprintId: SprintId,
    ): Promise<SprintEntity | null>;

    findByProjectId(projectId: ProjectId): Promise<SprintEntity[]>;

    workspaceExists(workspaceId: WorkspaceId): Promise<boolean>;

    projectExistsInWorkspace(
        workspaceId: WorkspaceId,
        projectId: ProjectId,
    ): Promise<boolean>;

    isWorkspaceOwner(
        workspaceId: WorkspaceId,
        userId: UserId,
    ): Promise<boolean>;

    isProjectMember(
        projectId: ProjectId,
        userId: UserId,
    ): Promise<boolean>;

    findProjectMemberByProjectAndUser(
        projectId: ProjectId,
        userId: UserId,
    ): Promise<ProjectMemberDetailsForSprint | null>;

    findTaskByProjectAndId(
        workspaceId: WorkspaceId,
        projectId: ProjectId,
        taskId: TaskId,
    ): Promise<SprintTaskReferenceDetails | null>;

    findActiveSprintTaskByTaskId(
        taskId: TaskId,
    ): Promise<SprintTaskDetails | null>;

    findActiveSprintTasksBySprintId(
        sprintId: SprintId,
    ): Promise<SprintTaskDetails[]>;


    saveSprintTask(
        sprintTask: SprintTaskEntity,
    ): Promise<SprintTaskDetails>;

    findSprintTaskById(
        sprintTaskId: SprintTaskId,
    ): Promise<SprintTaskDetails | null>;

    updateSprintTask(
        sprintTask: SprintTaskEntity,
    ): Promise<SprintTaskDetails>;
}

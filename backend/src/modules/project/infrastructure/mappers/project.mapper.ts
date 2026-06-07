// src/modules/project/infrastructure/mappers/project.mapper.ts

import { Prisma } from '@prisma/client';

import {
    ProjectEntity,
    type ProjectStatus,
} from '../../domain/entities/project.entity';

import { ProjectDescription } from '../../domain/value-objects/project-description.vo';
import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectTitle } from '../../domain/value-objects/project-title.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

import { ProjectMemberMapper } from './project-member.mapper';

export type PrismaProjectWithMembers = Prisma.ProjectGetPayload<{
    include: {
        members: true;
    };
}>;

export class ProjectMapper {
    static toDomain(project: PrismaProjectWithMembers): ProjectEntity {
        return ProjectEntity.restore({
            id: ProjectId.create(project.id),
            workspaceId: WorkspaceId.create(project.workspaceId),
            createdBy: UserId.create(project.createdById),
            title: ProjectTitle.create(project.title),
            status: project.status as ProjectStatus,
            description: ProjectDescription.create(project.description),
            startDate: project.startDate,
            dueDate: project.dueDate,
            members: project.members.map(ProjectMemberMapper.toDomain),
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        });
    }

    static toPrismaCreate(
        project: ProjectEntity,
    ): Prisma.ProjectUncheckedCreateInput {
        return {
            id: project.getId(),
            workspaceId: project.getWorkspaceId(),
            createdById: project.getCreatedBy(),
            title: project.getTitle(),
            status: project.getStatus(),
            description: project.getDescription(),
            startDate: project.getStartDate(),
            dueDate: project.getDueDate(),
            createdAt: project.getCreatedAt(),
            updatedAt: project.getUpdatedAt(),
        };
    }

    static toPrismaUpdate(
        project: ProjectEntity,
    ): Prisma.ProjectUncheckedUpdateInput {
        return {
            title: project.getTitle(),
            status: project.getStatus(),
            description: project.getDescription(),
            startDate: project.getStartDate(),
            dueDate: project.getDueDate(),
            updatedAt: project.getUpdatedAt(),
        };
    }
}
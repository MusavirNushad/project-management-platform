// src/modules/project/infrastructure/mappers/project-member.mapper.ts

import { Prisma, ProjectMember as PrismaProjectMember } from '@prisma/client';

import { ProjectMemberEntity } from '../../domain/entities/project-member.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectMemberId } from '../../domain/value-objects/project-member-id.vo';
import { RoleId } from '../../domain/value-objects/role-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

export class ProjectMemberMapper {
    static toDomain(member: PrismaProjectMember): ProjectMemberEntity {
        return ProjectMemberEntity.restore({
            id: ProjectMemberId.create(member.id),
            projectId: ProjectId.create(member.projectId),
            userId: UserId.create(member.userId),
            roleId: RoleId.create(member.roleId),
            joinedAt: member.joinedAt,
        });
    }

    static toPrismaCreate(
        member: ProjectMemberEntity,
    ): Prisma.ProjectMemberUncheckedCreateInput {
        return {
            id: member.getId(),
            projectId: member.getProjectId(),
            userId: member.getUserId(),
            roleId: member.getRoleId(),
            joinedAt: member.getJoinedAt(),
        };
    }

    static toPrismaUpdate(
        member: ProjectMemberEntity,
    ): Prisma.ProjectMemberUncheckedUpdateInput {
        return {
            roleId: member.getRoleId(),
        };
    }
}
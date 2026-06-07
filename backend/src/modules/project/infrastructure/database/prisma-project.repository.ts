import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

import type {
    ProjectMemberDetails,
    ProjectRepositoryPort,
    ProjectRoleName,
    ProjectUserDetails,
} from '../../domain/ports/project.repository.port';

import { ProjectMemberAlreadyExistsError } from '../../domain/errors/project-domain.errors';

import { ProjectEntity } from '../../domain/entities/project.entity';

import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectMemberId } from '../../domain/value-objects/project-member-id.vo';
import { RoleId } from '../../domain/value-objects/role-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';

import { ProjectMapper } from '../mappers/project.mapper';
import { ProjectMemberMapper } from '../mappers/project-member.mapper';

type PrismaProjectMemberWithUserAndRole = Prisma.ProjectMemberGetPayload<{
    include: {
        user: {
            select: {
                id: true;
                name: true;
                email: true;
            };
        };
        role: {
            select: {
                id: true;
                name: true;
            };
        };
    };
}>;

@Injectable()
export class PrismaProjectRepository implements ProjectRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async save(project: ProjectEntity): Promise<ProjectEntity> {
        try {
            const savedProject = await this.prisma.$transaction(async (tx) => {
                const prismaProject = await tx.project.upsert({
                    where: {
                        id: project.getId(),
                    },
                    create: ProjectMapper.toPrismaCreate(project),
                    update: ProjectMapper.toPrismaUpdate(project),
                    include: {
                        members: true,
                    },
                });

                const members = project.getMembers();

                for (const member of members) {
                    await tx.projectMember.upsert({
                        where: {
                            projectId_userId: {
                                projectId: member.getProjectId(),
                                userId: member.getUserId(),
                            },
                        },
                        create: ProjectMemberMapper.toPrismaCreate(member),
                        update: ProjectMemberMapper.toPrismaUpdate(member),
                    });
                }

                return tx.project.findUniqueOrThrow({
                    where: {
                        id: prismaProject.id,
                    },
                    include: {
                        members: true,
                    },
                });
            });

            return ProjectMapper.toDomain(savedProject);
        } catch (error) {
            if (this.isUniqueConstraintError(error)) {
                const target = this.getUniqueConstraintTarget(error);

                if (target.includes('projectId') || target.includes('userId')) {
                    throw new ProjectMemberAlreadyExistsError();
                }
            }

            throw error;
        }
    }

    async findById(projectId: ProjectId): Promise<ProjectEntity | null> {
        const project = await this.prisma.project.findUnique({
            where: {
                id: projectId.value,
            },
            include: {
                members: true,
            },
        });

        return project ? ProjectMapper.toDomain(project) : null;
    }

    async findByWorkspaceAndId(
        workspaceId: WorkspaceId,
        projectId: ProjectId,
    ): Promise<ProjectEntity | null> {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId.value,
                workspaceId: workspaceId.value,
            },
            include: {
                members: true,
            },
        });

        return project ? ProjectMapper.toDomain(project) : null;
    }

    async findByWorkspaceId(
        workspaceId: WorkspaceId,
    ): Promise<ProjectEntity[]> {
        const projects = await this.prisma.project.findMany({
            where: {
                workspaceId: workspaceId.value,
            },
            include: {
                members: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return projects.map(ProjectMapper.toDomain);
    }

    async workspaceExists(workspaceId: WorkspaceId): Promise<boolean> {
        const count = await this.prisma.workspace.count({
            where: {
                id: workspaceId.value,
            },
        });

        return count > 0;
    }

    async isWorkspaceMember(
        workspaceId: WorkspaceId,
        userId: UserId,
    ): Promise<boolean> {
        const count = await this.prisma.workspaceMember.count({
            where: {
                workspaceId: workspaceId.value,
                userId: userId.value,
            },
        });

        return count > 0;
    }

    async isWorkspaceOwner(
        workspaceId: WorkspaceId,
        userId: UserId,
    ): Promise<boolean> {
        const count = await this.prisma.workspace.count({
            where: {
                id: workspaceId.value,
                ownerId: userId.value,
            },
        });

        return count > 0;
    }

    async findRoleIdByName(roleName: ProjectRoleName): Promise<RoleId | null> {
        const role = await this.prisma.role.findUnique({
            where: {
                name: roleName,
            },
            select: {
                id: true,
            },
        });

        return role ? RoleId.create(role.id) : null;
    }

    async findProjectMembersByProjectId(
        projectId: ProjectId,
    ): Promise<ProjectMemberDetails[]> {
        const members = await this.prisma.projectMember.findMany({
            where: {
                projectId: projectId.value,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                joinedAt: 'asc',
            },
        });

        return members.map((member) => this.toProjectMemberDetails(member));
    }

    async findUserByEmail(email: string): Promise<ProjectUserDetails | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email.trim().toLowerCase(),
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        return user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
            }
            : null;
    }

    async findProjectMemberDetailsByProjectAndUser(
        projectId: ProjectId,
        userId: UserId,
    ): Promise<ProjectMemberDetails | null> {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: projectId.value,
                    userId: userId.value,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return member ? this.toProjectMemberDetails(member) : null;
    }

    async findProjectMemberDetailsById(
        memberId: ProjectMemberId,
    ): Promise<ProjectMemberDetails | null> {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                id: memberId.value,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return member ? this.toProjectMemberDetails(member) : null;
    }

    async updateProjectMemberRoleById(
        memberId: ProjectMemberId,
        roleId: RoleId,
    ): Promise<ProjectMemberDetails> {
        const member = await this.prisma.projectMember.update({
            where: {
                id: memberId.value,
            },
            data: {
                roleId: roleId.value,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return this.toProjectMemberDetails(member);
    }

    async deleteProjectMemberById(memberId: ProjectMemberId): Promise<void> {
        await this.prisma.projectMember.delete({
            where: {
                id: memberId.value,
            },
        });
    }

    private isUniqueConstraintError(
        error: unknown,
    ): error is Prisma.PrismaClientKnownRequestError {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        );
    }

    private getUniqueConstraintTarget(
        error: Prisma.PrismaClientKnownRequestError,
    ): string[] {
        const target = error.meta?.target;

        if (Array.isArray(target)) {
            return target.map(String);
        }

        if (typeof target === 'string') {
            return [target];
        }

        return [];
    }

    private toProjectMemberDetails(
        member: PrismaProjectMemberWithUserAndRole,
    ): ProjectMemberDetails {
        return {
            id: member.id,
            projectId: member.projectId,
            userId: member.userId,
            user: {
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
            },
            role: {
                id: member.role.id,
                name: member.role.name,
            },
            joinedAt: member.joinedAt,
        };
    }
}

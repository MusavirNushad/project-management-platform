import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';

import type {
    WorkspaceRepositoryPort,
    WorkspaceRoleName,
    WorkspaceMemberDetails,
    WorkspaceUserDetails,
} from '../../domain/ports/workspace.repository.port';

import {
    WorkspaceAlreadyExistsError,
    WorkspaceMemberAlreadyExistsError,
} from '../../domain/errors/workspace-domain.errors';

import { WorkspaceEntity } from '../../domain/entities/workspace.entity';

import { RoleId } from '../../domain/value-objects/role-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { WorkspaceId } from '../../domain/value-objects/workspace-id.vo';
import { WorkspaceSlug } from '../../domain/value-objects/workspace-slug.vo';
import { WorkspaceMemberId } from '../../domain/value-objects/workspace-member-id.vo';

import { WorkspaceMapper } from '../mappers/workspace.mapper';
import { WorkspaceMemberMapper } from '../mappers/workspace-member.mapper';

@Injectable()
export class PrismaWorkspaceRepository implements WorkspaceRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async save(workspace: WorkspaceEntity): Promise<WorkspaceEntity> {
        try {
            const savedWorkspace = await this.prisma.$transaction(async (tx) => {
                const prismaWorkspace = await tx.workspace.upsert({
                    where: {
                        id: workspace.getId(),
                    },
                    create: WorkspaceMapper.toPrismaCreate(workspace),
                    update: WorkspaceMapper.toPrismaUpdate(workspace),
                    include: {
                        members: true,
                    },
                });

                const members = workspace.getMembers();

                for (const member of members) {
                    await tx.workspaceMember.upsert({
                        where: {
                            workspaceId_userId: {
                                workspaceId: member.getWorkspaceId(),
                                userId: member.getUserId(),
                            },
                        },
                        create: WorkspaceMemberMapper.toPrismaCreate(member),
                        update: WorkspaceMemberMapper.toPrismaUpdate(member),
                    });
                }

                return tx.workspace.findUniqueOrThrow({
                    where: {
                        id: prismaWorkspace.id,
                    },
                    include: {
                        members: true,
                    },
                });
            });

            return WorkspaceMapper.toDomain(savedWorkspace);
        } catch (error) {
            if (this.isUniqueConstraintError(error)) {
                const target = this.getUniqueConstraintTarget(error);

                if (target.includes('slug')) {
                    throw new WorkspaceAlreadyExistsError();
                }

                if (target.includes('workspace_id') || target.includes('user_id')) {
                    throw new WorkspaceMemberAlreadyExistsError();
                }
            }

            throw error;
        }
    }

    async findById(id: WorkspaceId): Promise<WorkspaceEntity | null> {
        const workspace = await this.prisma.workspace.findUnique({
            where: {
                id: id.value,
            },
            include: {
                members: true,
            },
        });

        return workspace ? WorkspaceMapper.toDomain(workspace) : null;
    }

    async findBySlug(slug: WorkspaceSlug): Promise<WorkspaceEntity | null> {
        const workspace = await this.prisma.workspace.findUnique({
            where: {
                slug: slug.value,
            },
            include: {
                members: true,
            },
        });

        return workspace ? WorkspaceMapper.toDomain(workspace) : null;
    }

    async existsBySlug(slug: WorkspaceSlug): Promise<boolean> {
        const count = await this.prisma.workspace.count({
            where: {
                slug: slug.value,
            },
        });

        return count > 0;
    }

    async findByMemberUserId(userId: UserId): Promise<WorkspaceEntity[]> {
        const workspaces = await this.prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId: userId.value,
                    },
                },
            },
            include: {
                members: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return workspaces.map(WorkspaceMapper.toDomain);
    }

    async isUserMember(
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

    async findRoleIdByName(roleName: WorkspaceRoleName): Promise<RoleId | null> {
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

    async findMembersByWorkspaceId(
        workspaceId: WorkspaceId,
    ): Promise<WorkspaceMemberDetails[]> {
        const members = await this.prisma.workspaceMember.findMany({
            where: {
                workspaceId: workspaceId.value,
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

        return members.map((member) => ({
            id: member.id,
            workspaceId: member.workspaceId,
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
        }));
    }

    async findUserByEmail(email: string): Promise<WorkspaceUserDetails | null> {
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

    async findMemberDetailsByWorkspaceAndUser(
        workspaceId: WorkspaceId,
        userId: UserId,
    ): Promise<WorkspaceMemberDetails | null> {
        const member = await this.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: workspaceId.value,
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

        return member
            ? {
                id: member.id,
                workspaceId: member.workspaceId,
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
            }
            : null;
    }


    async findMemberDetailsById(
        memberId: WorkspaceMemberId,
    ): Promise<WorkspaceMemberDetails | null> {
        const member = await this.prisma.workspaceMember.findUnique({
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

        return member
            ? {
                id: member.id,
                workspaceId: member.workspaceId,
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
            }
            : null;
    }

    async deleteMemberById(memberId: WorkspaceMemberId): Promise<void> {
        await this.prisma.workspaceMember.delete({
            where: {
                id: memberId.value,
            },
        });
    }


}
// src/modules/identity/infrastructure/database/prisma-user.repository.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
    USER_REPOSITORY,
    UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserAlreadyExistsError } from '../../domain/errors/identity-domain.errors';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { UserMapper } from '../mappers/user.mapper';
import { UserProfileMapper } from '../mappers/user-profile.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async save(user: UserEntity): Promise<UserEntity> {
        try {
            const savedUser = await this.prisma.$transaction(async (tx) => {
                const prismaUser = await tx.user.upsert({
                    where: {
                        id: user.getId(),
                    },
                    create: UserMapper.toPrismaCreate(user),
                    update: UserMapper.toPrismaUpdate(user),
                    include: {
                        profile: true,
                    },
                });

                const profile = user.getProfile();

                if (profile) {
                    await tx.userProfile.upsert({
                        where: {
                            userId: user.getId(),
                        },
                        create: UserProfileMapper.toPrismaCreate(profile),
                        update: UserProfileMapper.toPrismaUpdate(profile),
                    });
                }

                return tx.user.findUniqueOrThrow({
                    where: {
                        id: prismaUser.id,
                    },
                    include: {
                        profile: true,
                    },
                });
            });

            return UserMapper.toDomain(savedUser);
        } catch (error) {
            if (this.isUniqueConstraintError(error)) {
                throw new UserAlreadyExistsError();
            }

            throw error;
        }
    }

    async findById(id: UserId): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id.value,
            },
            include: {
                profile: true,
            },
        });

        return user ? UserMapper.toDomain(user) : null;
    }

    async findByEmail(email: Email): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email.value,
            },
            include: {
                profile: true,
            },
        });

        return user ? UserMapper.toDomain(user) : null;
    }

    async existsByEmail(email: Email): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: {
                email: email.value,
            },
        });

        return count > 0;
    }

    private isUniqueConstraintError(error: unknown): boolean {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        );
    }
}
// src/modules/identity/infrastructure/mappers/user-profile.mapper.ts

import { Prisma, UserProfile as PrismaUserProfile } from '@prisma/client';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserProfileId } from '../../domain/value-objects/user-profile-id.vo';

export class UserProfileMapper {
    static toDomain(profile: PrismaUserProfile): UserProfileEntity {
        return UserProfileEntity.restore({
            id: UserProfileId.create(profile.id),
            userId: UserId.create(profile.userId),
            phoneNumber: profile.phoneNumber,
            designation: profile.designation,
            address: profile.address,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        });
    }

    static toPrismaCreate(
        profile: UserProfileEntity,
    ): Prisma.UserProfileUncheckedCreateInput {
        return {
            id: profile.getId(),
            userId: profile.getUserId(),
            phoneNumber: profile.getPhoneNumber(),
            designation: profile.getDesignation(),
            address: profile.getAddress(),
        };
    }

    static toPrismaUpdate(
        profile: UserProfileEntity,
    ): Prisma.UserProfileUncheckedUpdateInput {
        return {
            phoneNumber: profile.getPhoneNumber(),
            designation: profile.getDesignation(),
            address: profile.getAddress(),
        };
    }
}
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

import { UserProfileEntity } from '../../../domain/entities/user-profile.entity';
import type { UserEntity } from '../../../domain/entities/user.entity';
import { UserNotFoundError } from '../../../domain/errors/identity-domain.errors';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserProfileId } from '../../../domain/value-objects/user-profile-id.vo';

export type UpdateUserProfileInput = {
    userId: string;
    phoneNumber?: string | null;
    designation?: string | null;
    address?: string | null;
};

export type UpdateUserProfileResult = {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    profile: {
        id: string;
        phoneNumber: string | null;
        designation: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    createdAt: Date;
    updatedAt: Date;
};

@Injectable()
export class UpdateUserProfileService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepositoryPort,
    ) { }

    async execute(
        input: UpdateUserProfileInput,
    ): Promise<UpdateUserProfileResult> {
        const userId = UserId.create(input.userId);

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new UserNotFoundError();
        }

        if (!this.hasProfileChanges(input)) {
            return this.toResult(user);
        }

        const existingProfile = user.getProfile();

        if (existingProfile) {
            existingProfile.updateProfile({
                phoneNumber: input.phoneNumber,
                designation: input.designation,
                address: input.address,
            });

            user.updateProfile(existingProfile);
        } else {
            const profile = UserProfileEntity.create({
                id: UserProfileId.create(randomUUID()),
                userId,
                phoneNumber: input.phoneNumber,
                designation: input.designation,
                address: input.address,
            });

            user.updateProfile(profile);
        }

        const savedUser = await this.userRepository.save(user);

        return this.toResult(savedUser);
    }

    private hasProfileChanges(input: UpdateUserProfileInput): boolean {
        return (
            input.phoneNumber !== undefined ||
            input.designation !== undefined ||
            input.address !== undefined
        );
    }

    private toResult(user: UserEntity): UpdateUserProfileResult {
        const profile = user.getProfile();

        return {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail(),
            isVerified: user.getIsVerified(),
            profile: profile
                ? {
                    id: profile.getId(),
                    phoneNumber: profile.getPhoneNumber(),
                    designation: profile.getDesignation(),
                    address: profile.getAddress(),
                    createdAt: profile.getCreatedAt(),
                    updatedAt: profile.getUpdatedAt(),
                }
                : null,
            createdAt: user.getCreatedAt(),
            updatedAt: user.getUpdatedAt(),
        };
    }
}
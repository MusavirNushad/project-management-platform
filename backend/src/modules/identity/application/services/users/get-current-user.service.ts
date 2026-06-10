// src/modules/identity/application/services/users/get-current-user.service.ts

import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import type { UserRepositoryPort } from '../../../domain/ports/user.repository.port';

import { UserNotFoundError } from '../../../domain/errors/identity-domain.errors';
import type { UserProfileEntity } from '../../../domain/entities/user-profile.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';

export type GetCurrentUserInput = {
  userId: string;
};

export type GetCurrentUserResult = {
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
export class GetCurrentUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: GetCurrentUserInput): Promise<GetCurrentUserResult> {
    const userId = UserId.create(input.userId);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      isVerified: user.getIsVerified(),
      profile: this.mapProfile(user.getProfile()),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }

  private mapProfile(
    profile: UserProfileEntity | null,
  ): GetCurrentUserResult['profile'] {
    if (!profile) {
      return null;
    }

    return {
      id: profile.getId(),
      phoneNumber: profile.getPhoneNumber(),
      designation: profile.getDesignation(),
      address: profile.getAddress(),
      createdAt: profile.getCreatedAt(),
      updatedAt: profile.getUpdatedAt(),
    };
  }
}

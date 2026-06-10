// src/modules/identity/infrastructure/mappers/user.mapper.ts

import { Prisma } from '@prisma/client';
import { UserEntity } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHash } from '../../domain/value-objects/password.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserName } from '../../domain/value-objects/user-name.vo';
import { UserProfileMapper } from './user-profile.mapper';

export type PrismaUserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: true;
  };
}>;

export class UserMapper {
  static toDomain(user: PrismaUserWithProfile): UserEntity {
    return UserEntity.restore({
      id: UserId.create(user.id),
      name: UserName.create(user.name),
      email: Email.create(user.email),
      passwordHash: PasswordHash.create(user.passwordHash),
      isVerified: user.isVerified,
      profile: user.profile ? UserProfileMapper.toDomain(user.profile) : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static toPrismaCreate(user: UserEntity): Prisma.UserUncheckedCreateInput {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      passwordHash: user.getPasswordHash(),
      isVerified: user.getIsVerified(),
    };
  }

  static toPrismaUpdate(user: UserEntity): Prisma.UserUncheckedUpdateInput {
    return {
      name: user.getName(),
      email: user.getEmail(),
      passwordHash: user.getPasswordHash(),
      isVerified: user.getIsVerified(),
    };
  }
}

// src/modules/identity/domain/entities/user.entity.ts

import { UserProfileUserMismatchError } from '../errors/identity-domain.errors';
import { Email } from '../value-objects/email.vo';
import { PasswordHash } from '../value-objects/password.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserName } from '../value-objects/user-name.vo';
import { UserProfileEntity } from './user-profile.entity';

export type UserCreateProps = {
  id: UserId;
  name: UserName;
  email: Email;
  passwordHash: PasswordHash;
  profile?: UserProfileEntity | null;
};

export type UserRestoreProps = UserCreateProps & {
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class UserEntity {
  private constructor(
    private readonly id: UserId,
    private name: UserName,
    private readonly email: Email,
    private passwordHash: PasswordHash,
    private isVerified: boolean,
    private profile: UserProfileEntity | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    this.ensureProfileBelongsToUser(profile);
  }

  static create(props: UserCreateProps): UserEntity {
    const now = new Date();

    return new UserEntity(
      props.id,
      props.name,
      props.email,
      props.passwordHash,
      false,
      props.profile ?? null,
      now,
      now,
    );
  }

  static restore(props: UserRestoreProps): UserEntity {
    return new UserEntity(
      props.id,
      props.name,
      props.email,
      props.passwordHash,
      props.isVerified,
      props.profile ?? null,
      props.createdAt,
      props.updatedAt,
    );
  }

  verifyEmail(): void {
    if (this.isVerified) {
      return;
    }

    this.isVerified = true;
    this.touch();
  }

  changeName(name: UserName): void {
    if (this.name.equals(name)) {
      return;
    }

    this.name = name;
    this.touch();
  }

  changePasswordHash(passwordHash: PasswordHash): void {
    if (this.passwordHash.equals(passwordHash)) {
      return;
    }

    this.passwordHash = passwordHash;
    this.touch();
  }

  updateProfile(profile: UserProfileEntity): void {
    this.ensureProfileBelongsToUser(profile);

    this.profile = profile;
    this.touch();
  }

  getId(): string {
    return this.id.value;
  }

  getName(): string {
    return this.name.value;
  }

  getEmail(): string {
    return this.email.value;
  }

  getPasswordHash(): string {
    return this.passwordHash.value;
  }

  getIsVerified(): boolean {
    return this.isVerified;
  }

  getProfile(): UserProfileEntity | null {
    return this.profile;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private ensureProfileBelongsToUser(profile?: UserProfileEntity | null): void {
    if (!profile) {
      return;
    }

    if (profile.getUserId() !== this.id.value) {
      throw new UserProfileUserMismatchError();
    }
  }
}

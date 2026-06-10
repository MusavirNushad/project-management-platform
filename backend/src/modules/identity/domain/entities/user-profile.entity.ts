// src/modules/identity/domain/entities/user-profile.entity.ts

import { UserId } from '../value-objects/user-id.vo';
import { UserProfileId } from '../value-objects/user-profile-id.vo';

export type UserProfileCreateProps = {
  id: UserProfileId;
  userId: UserId;
  phoneNumber?: string | null;
  designation?: string | null;
  address?: string | null;
};

export type UserProfileRestoreProps = UserProfileCreateProps & {
  createdAt: Date;
  updatedAt: Date;
};

export class UserProfileEntity {
  private constructor(
    private readonly id: UserProfileId,
    private readonly userId: UserId,
    private phoneNumber: string | null,
    private designation: string | null,
    private address: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: UserProfileCreateProps): UserProfileEntity {
    const now = new Date();

    return new UserProfileEntity(
      props.id,
      props.userId,
      this.normalizeOptionalString(props.phoneNumber),
      this.normalizeOptionalString(props.designation),
      this.normalizeOptionalString(props.address),
      now,
      now,
    );
  }

  static restore(props: UserProfileRestoreProps): UserProfileEntity {
    return new UserProfileEntity(
      props.id,
      props.userId,
      this.normalizeOptionalString(props.phoneNumber),
      this.normalizeOptionalString(props.designation),
      this.normalizeOptionalString(props.address),
      props.createdAt,
      props.updatedAt,
    );
  }

  updateProfile(input: {
    phoneNumber?: string | null;
    designation?: string | null;
    address?: string | null;
  }): void {
    if (input.phoneNumber !== undefined) {
      this.phoneNumber = UserProfileEntity.normalizeOptionalString(
        input.phoneNumber,
      );
    }

    if (input.designation !== undefined) {
      this.designation = UserProfileEntity.normalizeOptionalString(
        input.designation,
      );
    }

    if (input.address !== undefined) {
      this.address = UserProfileEntity.normalizeOptionalString(input.address);
    }

    this.touch();
  }

  getId(): string {
    return this.id.value;
  }

  getUserId(): string {
    return this.userId.value;
  }

  getPhoneNumber(): string | null {
    return this.phoneNumber;
  }

  getDesignation(): string | null {
    return this.designation;
  }

  getAddress(): string | null {
    return this.address;
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

  private static normalizeOptionalString(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }
}

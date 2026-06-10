import type { GetCurrentUserResult } from '../../../application/services/users/get-current-user.service';
import type { UpdateUserProfileResult } from '../../../application/services/users/update-user-profile.service';

type UserServiceResult = GetCurrentUserResult | UpdateUserProfileResult;

export class UserProfileResponseDto {
  id!: string;
  phoneNumber!: string | null;
  designation!: string | null;
  address!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  isVerified!: boolean;
  profile!: UserProfileResponseDto | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromResult(result: UserServiceResult): UserResponseDto {
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      isVerified: result.isVerified,
      profile: result.profile
        ? {
            id: result.profile.id,
            phoneNumber: result.profile.phoneNumber,
            designation: result.profile.designation,
            address: result.profile.address,
            createdAt: result.profile.createdAt,
            updatedAt: result.profile.updatedAt,
          }
        : null,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}

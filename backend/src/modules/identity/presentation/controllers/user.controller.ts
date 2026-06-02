import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { ChangePasswordService } from '../../application/services/users/change-password.service';
import { GetCurrentUserService } from '../../application/services/users/get-current-user.service';
import { UpdateUserProfileService } from '../../application/services/users/update-user-profile.service';

import { CurrentUser } from '../../infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';

import { ChangePasswordRequestDto } from '../dtos/requests/change-password.request.dto';
import { UpdateUserProfileRequestDto } from '../dtos/requests/update-user-profile.request.dto';

import { ChangePasswordResponseDto } from '../dtos/responses/change-password.response.dto';
import { UserResponseDto } from '../dtos/responses/user.response.dto';

@Controller('users')
export class UserController {
    constructor(
        private readonly getCurrentUserService: GetCurrentUserService,
        private readonly updateUserProfileService: UpdateUserProfileService,
        private readonly changePasswordService: ChangePasswordService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(
        @CurrentUser('userId') userId: string,
    ): Promise<UserResponseDto> {
        const result = await this.getCurrentUserService.execute({
            userId,
        });

        return UserResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/profile')
    async updateMyProfile(
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateUserProfileRequestDto,
    ): Promise<UserResponseDto> {
        const result = await this.updateUserProfileService.execute({
            userId,
            phoneNumber: dto.phoneNumber,
            designation: dto.designation,
            address: dto.address,
        });

        return UserResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/password')
    async changeMyPassword(
        @CurrentUser('userId') userId: string,
        @Body() dto: ChangePasswordRequestDto,
    ): Promise<ChangePasswordResponseDto> {
        const result = await this.changePasswordService.execute({
            userId,
            currentPassword: dto.currentPassword,
            newPassword: dto.newPassword,
        });

        return ChangePasswordResponseDto.fromResult(result);
    }
}
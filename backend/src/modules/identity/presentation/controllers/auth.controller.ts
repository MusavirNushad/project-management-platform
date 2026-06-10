import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { LoginUserService } from '../../application/services/auth/login-user.service';
import { LogoutUserService } from '../../application/services/auth/logout-user.service';
import { RefreshTokenService } from '../../application/services/auth/refresh-token.service';
import { RegisterUserService } from '../../application/services/auth/register-user.service';

import { CurrentUser } from '../../infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';

import { LoginUserRequestDto } from '../dtos/requests/login-user.request.dto';
import { RefreshTokenRequestDto } from '../dtos/requests/refresh-token.request.dto';
import { RegisterUserRequestDto } from '../dtos/requests/register-user.request.dto';

import { AuthResponseDto } from '../dtos/responses/auth.response.dto';
import { LogoutResponseDto } from '../dtos/responses/logout.response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly loginUserService: LoginUserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logoutUserService: LogoutUserService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterUserRequestDto,
  ): Promise<AuthResponseDto> {
    const result = await this.registerUserService.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    return AuthResponseDto.fromResult(result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginUserRequestDto): Promise<AuthResponseDto> {
    const result = await this.loginUserService.execute({
      email: dto.email,
      password: dto.password,
    });

    return AuthResponseDto.fromResult(result);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    const result = await this.refreshTokenService.execute({
      refreshToken: dto.refreshToken,
    });

    return AuthResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser('userId') userId: string,
  ): Promise<LogoutResponseDto> {
    const result = await this.logoutUserService.execute({
      userId,
    });

    return LogoutResponseDto.fromResult(result);
  }
}

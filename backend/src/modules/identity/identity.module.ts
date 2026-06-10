import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';

import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port';
import { TOKEN_SERVICE } from './application/ports/token-service.port';

import { PrismaUserRepository } from './infrastructure/database/prisma-user.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';

import { RegisterUserService } from './application/services/auth/register-user.service';
import { LoginUserService } from './application/services/auth/login-user.service';
import { LogoutUserService } from './application/services/auth/logout-user.service';
import { GetCurrentUserService } from './application/services/users/get-current-user.service';
import { RefreshTokenService } from './application/services/auth/refresh-token.service';
import { UpdateUserProfileService } from './application/services/users/update-user-profile.service';
import { ChangePasswordService } from './application/services/users/change-password.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [ConfigModule, JwtModule.register({}), PrismaModule],
  controllers: [AuthController, UserController],
  providers: [
    RegisterUserService,
    RefreshTokenService,
    LoginUserService,
    LogoutUserService,
    GetCurrentUserService,
    UpdateUserProfileService,
    ChangePasswordService,
    JwtAuthGuard,

    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
  ],
  exports: [JwtAuthGuard, TOKEN_SERVICE],
})
export class IdentityModule {}

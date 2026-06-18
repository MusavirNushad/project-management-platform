import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';

import { ACCESS_CONTROL_REPOSITORY } from './application/ports/access-control.repository.port';

import { AccessControlService } from './application/services/access-control.service';
import { PrismaAccessControlRepository } from './infrastructure/database/prisma-access-control.repository';

import { AccessControlGuard } from './presentation/guards/access-control.guard';

@Module({
  imports: [PrismaModule],
  providers: [
    AccessControlService,
    AccessControlGuard,
    {
      provide: ACCESS_CONTROL_REPOSITORY,
      useClass: PrismaAccessControlRepository,
    },
  ],
  exports: [AccessControlService, AccessControlGuard],
})
export class AccessControlModule { }

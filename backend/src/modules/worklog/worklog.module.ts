import { Module } from '@nestjs/common';

import { AccessControlModule } from '../access-control/access-control.module';
import { IdentityModule } from '../identity/identity.module';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';

import { CreateWorklogService } from './application/services/worklogs/create-worklog.service';
import { DeleteWorklogService } from './application/services/worklogs/delete-worklog.service';
import { GetTaskWorklogsService } from './application/services/worklogs/get-task-worklogs.service';
import { GetWorklogByIdService } from './application/services/worklogs/get-worklog-by-id.service';
import { UpdateWorklogService } from './application/services/worklogs/update-worklog.service';

import { WORKLOG_REPOSITORY } from './domain/ports/worklog.repository.port';

import { PrismaWorklogRepository } from './infrastructure/database/prisma-worklog.repository';

import { WorklogController } from './presentation/controllers/worklog.controller';
import { WorklogOwnerOrProjectAdminGuard } from './presentation/guards/worklog-owner-or-project-admin.guard';

@Module({
  imports: [PrismaModule, IdentityModule, AccessControlModule],
  controllers: [WorklogController],
  providers: [
    GetTaskWorklogsService,
    CreateWorklogService,
    GetWorklogByIdService,
    UpdateWorklogService,
    DeleteWorklogService,

    WorklogOwnerOrProjectAdminGuard,

    {
      provide: WORKLOG_REPOSITORY,
      useClass: PrismaWorklogRepository,
    },
  ],
})
export class WorklogModule { }

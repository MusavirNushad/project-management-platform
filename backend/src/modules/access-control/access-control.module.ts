// src/modules/access-control/access-control.module.ts

import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';

import {
    ACCESS_CONTROL_REPOSITORY,
} from './application/ports/access-control.repository.port';

import { AccessControlService } from './application/services/access-control.service';
import { PrismaAccessControlRepository } from './infrastructure/database/prisma-access-control.repository';
import { ProjectRoleGuard } from './presentation/guards/project-role.guard';
import { WorkspaceRoleGuard } from './presentation/guards/workspace-role.guard';

@Module({
    imports: [PrismaModule],
    providers: [
        AccessControlService,
        ProjectRoleGuard,
        WorkspaceRoleGuard,
        {
            provide: ACCESS_CONTROL_REPOSITORY,
            useClass: PrismaAccessControlRepository,
        },
    ],
    exports: [
        AccessControlService,
        ProjectRoleGuard,
        WorkspaceRoleGuard,
    ],
})
export class AccessControlModule { }
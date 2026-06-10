import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { AccessControlModule } from '../access-control/access-control.module';

import { SprintPermissionService } from './application/services/permissions/sprint-permission.service';
import { CreateSprintService } from './application/services/sprints/create-sprint.service';
import { GetProjectSprintsService } from './application/services/sprints/get-project-sprints.service';
import { GetSprintByIdService } from './application/services/sprints/get-sprint-by-id.service';
import { UpdateSprintService } from './application/services/sprints/update-sprint.service';
import { AddTaskToSprintService } from './application/services/tasks/add-task-to-sprint.service';
import { GetSprintTasksService } from './application/services/tasks/get-sprint-tasks.service';
import { RemoveTaskFromSprintService } from './application/services/tasks/remove-task-from-sprint.service';

import { SPRINT_REPOSITORY } from './domain/ports/sprint.repository.port';

import { PrismaSprintRepository } from './infrastructure/database/prisma-sprint.repository';

import { SprintController } from './presentation/controllers/sprint.controller';
import { SprintTaskController } from './presentation/controllers/sprint-task.controller';

@Module({
  imports: [PrismaModule, IdentityModule, AccessControlModule],
  controllers: [SprintController, SprintTaskController],
  providers: [
    CreateSprintService,
    GetProjectSprintsService,
    GetSprintByIdService,
    UpdateSprintService,
    SprintPermissionService,
    AddTaskToSprintService,
    GetSprintTasksService,
    RemoveTaskFromSprintService,
    {
      provide: SPRINT_REPOSITORY,
      useClass: PrismaSprintRepository,
    },
  ],
})
export class SprintModule {}

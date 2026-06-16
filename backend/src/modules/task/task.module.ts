import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { AccessControlModule } from '../access-control/access-control.module';

import { TaskRealtimeGateway } from './presentation/gateways/task-realtime.gateway';
import { TaskRealtimeAccessService } from './application/services/realtime/task-realtime-access.service';
import { TaskRealtimeEventsService } from './application/services/realtime/task-realtime-events.service';

import { CreateTaskService } from './application/services/tasks/create-task.service';
import { GetProjectTasksService } from './application/services/tasks/get-project-tasks.service';
import { UpdateTaskService } from './application/services/tasks/update-task.service';
import { TaskPermissionService } from './application/services/permissions/task-permission.service';
import { AddTaskAssigneeService } from './application/services/assignees/add-task-assignee.service';
import { GetTaskAssigneesService } from './application/services/assignees/get-task-assignees.service';
import { RemoveTaskAssigneeService } from './application/services/assignees/remove-task-assignee.service';
import { CreateTaskCommentService } from './application/services/comments/create-task-comment.service';
import { DeleteTaskCommentService } from './application/services/comments/delete-task-comment.service';
import { GetTaskCommentsService } from './application/services/comments/get-task-comments.service';
import { UpdateTaskCommentService } from './application/services/comments/update-task-comment.service';

import { TASK_REPOSITORY } from './domain/ports/task.repository.port';

import { PrismaTaskRepository } from './infrastructure/database/prisma-task.repository';

import { TaskController } from './presentation/controllers/task.controller';
import { TaskAssigneeController } from './presentation/controllers/task-assignee.controller';
import { TaskCommentController } from './presentation/controllers/task-comment.controller';

@Module({
  imports: [PrismaModule, IdentityModule, AccessControlModule],
  controllers: [TaskController, TaskAssigneeController, TaskCommentController],
  providers: [

    TaskRealtimeGateway,
    TaskRealtimeEventsService,
    TaskRealtimeAccessService,

    CreateTaskService,
    GetProjectTasksService,
    UpdateTaskService,
    TaskPermissionService,
    AddTaskAssigneeService,
    GetTaskAssigneesService,
    RemoveTaskAssigneeService,
    CreateTaskCommentService,
    GetTaskCommentsService,
    UpdateTaskCommentService,
    DeleteTaskCommentService,
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
  ],
})
export class TaskModule { }

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AddTaskToSprintService } from '../../application/services/tasks/add-task-to-sprint.service';
import { GetSprintTasksService } from '../../application/services/tasks/get-sprint-tasks.service';
import { RemoveTaskFromSprintService } from '../../application/services/tasks/remove-task-from-sprint.service';

import { RequireRoles } from '../../../access-control/presentation/decorators/require-roles.decorator';
import { AccessControlGuard } from '../../../access-control/presentation/guards/access-control.guard';

import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { AddTaskToSprintRequestDto } from '../dtos/requests/add-task-to-sprint.request.dto';

import { RemoveTaskFromSprintResponseDto } from '../dtos/responses/remove-task-from-sprint.response.dto';
import { SprintTaskListResponseDto } from '../dtos/responses/sprint-task-list.response.dto';
import { SprintTaskResponseDto } from '../dtos/responses/sprint-task.response.dto';

@UseGuards(JwtAuthGuard, AccessControlGuard)
@Controller(
  'workspaces/:workspaceId/projects/:projectId/sprints/:sprintId/tasks',
)
export class SprintTaskController {
  constructor(
    private readonly addTaskToSprintService: AddTaskToSprintService,
    private readonly getSprintTasksService: GetSprintTasksService,
    private readonly removeTaskFromSprintService: RemoveTaskFromSprintService,
  ) { }

  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN'],
    allowWorkspaceOwner: true,
  })
  @Post()
  async addTaskToSprint(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: AddTaskToSprintRequestDto,
  ): Promise<SprintTaskResponseDto> {
    const result = await this.addTaskToSprintService.execute({
      workspaceId,
      projectId,
      sprintId,
      taskId: dto.taskId,
      position: dto.position,
    });

    return SprintTaskResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN', 'MEMBER'],
    allowWorkspaceOwner: true,
  })
  @Get()
  async getSprintTasks(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ): Promise<SprintTaskListResponseDto> {
    const result = await this.getSprintTasksService.execute({
      workspaceId,
      projectId,
      sprintId,
    });

    return SprintTaskListResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN'],
    allowWorkspaceOwner: true,
  })
  @Delete(':sprintTaskId')
  async removeTaskFromSprint(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Param('sprintTaskId') sprintTaskId: string,
  ): Promise<RemoveTaskFromSprintResponseDto> {
    const result = await this.removeTaskFromSprintService.execute({
      workspaceId,
      projectId,
      sprintId,
      sprintTaskId,
    });

    return RemoveTaskFromSprintResponseDto.fromResult(result);
  }
}
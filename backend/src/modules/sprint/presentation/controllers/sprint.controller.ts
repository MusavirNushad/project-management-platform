import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateSprintService } from '../../application/services/sprints/create-sprint.service';
import { GetProjectSprintsService } from '../../application/services/sprints/get-project-sprints.service';
import { GetSprintByIdService } from '../../application/services/sprints/get-sprint-by-id.service';
import { UpdateSprintService } from '../../application/services/sprints/update-sprint.service';

import { RequireRoles } from '../../../access-control/presentation/decorators/require-roles.decorator';
import { AccessControlGuard } from '../../../access-control/presentation/guards/access-control.guard';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateSprintRequestDto } from '../dtos/requests/create-sprint.request.dto';
import { UpdateSprintRequestDto } from '../dtos/requests/update-sprint.request.dto';

import { SprintListResponseDto } from '../dtos/responses/sprint-list.response.dto';
import { SprintResponseDto } from '../dtos/responses/sprint.response.dto';

@UseGuards(JwtAuthGuard, AccessControlGuard)
@Controller('workspaces/:workspaceId/projects/:projectId/sprints')
export class SprintController {
  constructor(
    private readonly createSprintService: CreateSprintService,
    private readonly getProjectSprintsService: GetProjectSprintsService,
    private readonly getSprintByIdService: GetSprintByIdService,
    private readonly updateSprintService: UpdateSprintService,
  ) { }

  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN'],
    allowWorkspaceOwner: true,
  })
  @Post()
  async createSprint(
    @CurrentUser('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintRequestDto,
  ): Promise<SprintResponseDto> {
    const result = await this.createSprintService.execute({
      workspaceId,
      projectId,
      createdBy: userId,
      name: dto.name,
      goal: dto.goal,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return SprintResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN', 'MEMBER'],
    allowWorkspaceOwner: true,
  })
  @Get()
  async getProjectSprints(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<SprintListResponseDto> {
    const result = await this.getProjectSprintsService.execute({
      workspaceId,
      projectId,
    });

    return SprintListResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN', 'MEMBER'],
    allowWorkspaceOwner: true,
  })
  @Get(':sprintId')
  async getSprintById(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ): Promise<SprintResponseDto> {
    const result = await this.getSprintByIdService.execute({
      workspaceId,
      projectId,
      sprintId,
    });

    return SprintResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN'],
    allowWorkspaceOwner: true,
  })
  @Patch(':sprintId')
  async updateSprint(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintRequestDto,
  ): Promise<SprintResponseDto> {
    const result = await this.updateSprintService.execute({
      workspaceId,
      projectId,
      sprintId,
      name: dto.name,
      goal: dto.goal,
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return SprintResponseDto.fromResult(result);
  }
}
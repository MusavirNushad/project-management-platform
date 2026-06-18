import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateProjectService } from '../../application/services/projects/create-project.service';
import { GetProjectByIdService } from '../../application/services/projects/get-project-by-id.service';
import { GetWorkspaceProjectsService } from '../../application/services/projects/get-workspace-projects.service';
import { UpdateProjectService } from '../../application/services/projects/update-project.service';

import { RequireRoles } from '../../../access-control/presentation/decorators/require-roles.decorator';
import { AccessControlGuard } from '../../../access-control/presentation/guards/access-control.guard';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateProjectRequestDto } from '../dtos/requests/create-project.request.dto';
import { UpdateProjectRequestDto } from '../dtos/requests/update-project.request.dto';

import { ProjectListResponseDto } from '../dtos/responses/project-list.response.dto';
import { ProjectResponseDto } from '../dtos/responses/project.response.dto';

@UseGuards(JwtAuthGuard, AccessControlGuard)
@Controller('workspaces/:workspaceId/projects')
export class ProjectController {
  constructor(
    private readonly createProjectService: CreateProjectService,
    private readonly getWorkspaceProjectsService: GetWorkspaceProjectsService,
    private readonly getProjectByIdService: GetProjectByIdService,
    private readonly updateProjectService: UpdateProjectService,
  ) { }

  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER'],
  })
  @Post()
  async createProject(
    @CurrentUser('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    const result = await this.createProjectService.execute({
      workspaceId,
      createdBy: userId,
      title: dto.title,
      description: dto.description,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
    });

    return ProjectResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER', 'ADMIN', 'MEMBER'],
  })
  @Get()
  async getWorkspaceProjects(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ProjectListResponseDto> {
    const result = await this.getWorkspaceProjectsService.execute({
      workspaceId,
    });

    return ProjectListResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER', 'ADMIN', 'MEMBER'],
  })
  @Get(':projectId')
  async getProjectById(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<ProjectResponseDto> {
    const result = await this.getProjectByIdService.execute({
      workspaceId,
      projectId,
    });

    return ProjectResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER'],
  })
  @Patch(':projectId')
  async updateProject(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    const result = await this.updateProjectService.execute({
      workspaceId,
      projectId,
      title: dto.title,
      description: dto.description,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      status: dto.status,
    });

    return ProjectResponseDto.fromResult(result);
  }
}


import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateWorkspaceService } from '../../application/services/workspaces/create-workspace.service';
import { GetMyWorkspacesService } from '../../application/services/workspaces/get-my-workspaces.service';
import { GetWorkspaceByIdService } from '../../application/services/workspaces/get-workspace-by-id.service';
import { UpdateWorkspaceService } from '../../application/services/workspaces/update-workspace.service';

import { RequireRoles } from '../../../access-control/presentation/decorators/require-roles.decorator';
import { AccessControlGuard } from '../../../access-control/presentation/guards/access-control.guard';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateWorkspaceRequestDto } from '../dtos/requests/create-workspace.request.dto';
import { UpdateWorkspaceRequestDto } from '../dtos/requests/update-workspace.request.dto';

import { WorkspaceListResponseDto } from '../dtos/responses/workspace-list.response.dto';
import { WorkspaceResponseDto } from '../dtos/responses/workspace.response.dto';

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly createWorkspaceService: CreateWorkspaceService,
    private readonly getMyWorkspacesService: GetMyWorkspacesService,
    private readonly getWorkspaceByIdService: GetWorkspaceByIdService,
    private readonly updateWorkspaceService: UpdateWorkspaceService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createWorkspace(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWorkspaceRequestDto,
  ): Promise<WorkspaceResponseDto> {
    const result = await this.createWorkspaceService.execute({
      ownerId: userId,
      name: dto.name,
      description: dto.description,
    });

    return WorkspaceResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyWorkspaces(
    @CurrentUser('userId') userId: string,
  ): Promise<WorkspaceListResponseDto> {
    const result = await this.getMyWorkspacesService.execute({
      userId,
    });

    return WorkspaceListResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard, AccessControlGuard)
  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER', 'ADMIN', 'MEMBER'],
  })
  @Get(':workspaceId')
  async getWorkspaceById(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceResponseDto> {
    const result = await this.getWorkspaceByIdService.execute({
      workspaceId,
    });

    return WorkspaceResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard, AccessControlGuard)
  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER'],
  })
  @Patch(':workspaceId')
  async updateWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceRequestDto,
  ): Promise<WorkspaceResponseDto> {
    const result = await this.updateWorkspaceService.execute({
      workspaceId,
      name: dto.name,
      description: dto.description,
    });

    return WorkspaceResponseDto.fromResult(result);
  }
}
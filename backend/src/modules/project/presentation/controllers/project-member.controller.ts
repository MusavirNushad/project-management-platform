import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AddProjectMemberService } from '../../application/services/members/add-project-member.service';
import { GetProjectMembersService } from '../../application/services/members/get-project-members.service';
import { RemoveProjectMemberService } from '../../application/services/members/remove-project-member.service';
import { UpdateProjectMemberRoleService } from '../../application/services/members/update-project-member-role.service';

import { RequireRoles } from '../../../access-control/presentation/decorators/require-roles.decorator';
import { AccessControlGuard } from '../../../access-control/presentation/guards/access-control.guard';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { AddProjectMemberRequestDto } from '../dtos/requests/add-project-member.request.dto';
import { UpdateProjectMemberRoleRequestDto } from '../dtos/requests/update-project-member-role.request.dto';

import { ProjectMemberListResponseDto } from '../dtos/responses/project-member-list.response.dto';
import { ProjectMemberResponseDto } from '../dtos/responses/project-member.response.dto';
import { RemoveProjectMemberResponseDto } from '../dtos/responses/remove-project-member.response.dto';

@Controller('workspaces/:workspaceId/projects/:projectId/members')
export class ProjectMemberController {
  constructor(
    private readonly getProjectMembersService: GetProjectMembersService,
    private readonly addProjectMemberService: AddProjectMemberService,
    private readonly updateProjectMemberRoleService: UpdateProjectMemberRoleService,
    private readonly removeProjectMemberService: RemoveProjectMemberService,
  ) { }

  @UseGuards(JwtAuthGuard, AccessControlGuard)
  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER', 'ADMIN', 'MEMBER'],
  })
  @Get()
  async getProjectMembers(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<ProjectMemberListResponseDto> {
    const result = await this.getProjectMembersService.execute({
      workspaceId,
      projectId,
    });

    return ProjectMemberListResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard, AccessControlGuard)
  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN'],
    allowWorkspaceOwner: true,
  })
  @Post()
  async addProjectMember(
    @CurrentUser('userId') actorUserId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMemberRequestDto,
  ): Promise<ProjectMemberResponseDto> {
    const result = await this.addProjectMemberService.execute({
      workspaceId,
      projectId,
      actorUserId,
      email: dto.email,
      roleName: dto.roleName,
    });

    return ProjectMemberResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard, AccessControlGuard)
  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN'],
    allowWorkspaceOwner: true,
  })
  @Patch(':memberId')
  async updateProjectMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateProjectMemberRoleRequestDto,
  ): Promise<ProjectMemberResponseDto> {
    const result = await this.updateProjectMemberRoleService.execute({
      workspaceId,
      projectId,
      memberId,
      roleName: dto.roleName,
    });

    return ProjectMemberResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard, AccessControlGuard)
  @RequireRoles({
    scope: 'project',
    roles: ['ADMIN'],
    allowWorkspaceOwner: true,
  })
  @Delete(':memberId')
  async removeProjectMember(
    @CurrentUser('userId') actorUserId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
  ): Promise<RemoveProjectMemberResponseDto> {
    const result = await this.removeProjectMemberService.execute({
      workspaceId,
      projectId,
      memberId,
      actorUserId,
    });

    return RemoveProjectMemberResponseDto.fromResult(result);
  }
}
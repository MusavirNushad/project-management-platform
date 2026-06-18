import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AddWorkspaceMemberService } from '../../application/services/members/add-workspace-member.service';
import { GetWorkspaceMembersService } from '../../application/services/members/get-workspace-members.service';
import { RemoveWorkspaceMemberService } from '../../application/services/members/remove-workspace-member.service';

import { RequireRoles } from '../../../access-control/presentation/decorators/require-roles.decorator';
import { AccessControlGuard } from '../../../access-control/presentation/guards/access-control.guard';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { AddWorkspaceMemberRequestDto } from '../dtos/requests/add-workspace-member.request.dto';

import { RemoveWorkspaceMemberResponseDto } from '../dtos/responses/remove-workspace-member.response.dto';
import { WorkspaceMemberListResponseDto } from '../dtos/responses/workspace-member-list.response.dto';
import { WorkspaceMemberResponseDto } from '../dtos/responses/workspace-member.response.dto';

@UseGuards(JwtAuthGuard, AccessControlGuard)
@Controller('workspaces/:workspaceId/members')
export class WorkspaceMemberController {
  constructor(
    private readonly getWorkspaceMembersService: GetWorkspaceMembersService,
    private readonly addWorkspaceMemberService: AddWorkspaceMemberService,
    private readonly removeWorkspaceMemberService: RemoveWorkspaceMemberService,
  ) { }

  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER', 'ADMIN', 'MEMBER'],
  })
  @Get()
  async getWorkspaceMembers(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceMemberListResponseDto> {
    const result = await this.getWorkspaceMembersService.execute({
      workspaceId,
    });

    return WorkspaceMemberListResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER'],
  })
  @Post()
  async addWorkspaceMember(
    @CurrentUser('userId') actorUserId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberResponseDto> {
    const result = await this.addWorkspaceMemberService.execute({
      workspaceId,
      actorUserId,
      email: dto.email,
      roleName: dto.roleName,
    });

    return WorkspaceMemberResponseDto.fromResult(result);
  }

  @RequireRoles({
    scope: 'workspace',
    roles: ['OWNER'],
  })
  @Delete(':memberId')
  async removeWorkspaceMember(
    @CurrentUser('userId') actorUserId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ): Promise<RemoveWorkspaceMemberResponseDto> {
    const result = await this.removeWorkspaceMemberService.execute({
      workspaceId,
      actorUserId,
      memberId,
    });

    return RemoveWorkspaceMemberResponseDto.fromResult(result);
  }
}
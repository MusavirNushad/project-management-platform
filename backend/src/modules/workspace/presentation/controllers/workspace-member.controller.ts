import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AddWorkspaceMemberService } from '../../application/services/members/add-workspace-member.service';
import { GetWorkspaceMembersService } from '../../application/services/members/get-workspace-members.service';
import { RemoveWorkspaceMemberService } from '../../application/services/members/remove-workspace-member.service';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { AddWorkspaceMemberRequestDto } from '../dtos/requests/add-workspace-member.request.dto';

import { WorkspaceMemberListResponseDto } from '../dtos/responses/workspace-member-list.response.dto';
import { WorkspaceMemberResponseDto } from '../dtos/responses/workspace-member.response.dto';
import { RemoveWorkspaceMemberResponseDto } from '../dtos/responses/remove-workspace-member.response.dto';

@Controller('workspaces/:workspaceId/members')
export class WorkspaceMemberController {
  constructor(
    private readonly getWorkspaceMembersService: GetWorkspaceMembersService,
    private readonly addWorkspaceMemberService: AddWorkspaceMemberService,
    private readonly removeWorkspaceMemberService: RemoveWorkspaceMemberService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWorkspaceMembers(
    @CurrentUser('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceMemberListResponseDto> {
    const result = await this.getWorkspaceMembersService.execute({
      workspaceId,
      userId,
    });

    return WorkspaceMemberListResponseDto.fromResult(result);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

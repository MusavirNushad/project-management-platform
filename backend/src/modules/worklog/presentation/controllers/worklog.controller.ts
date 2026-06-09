import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Delete,
    UseGuards,
} from '@nestjs/common';

import { CreateWorklogService } from '../../application/services/worklogs/create-worklog.service';
import { GetTaskWorklogsService } from '../../application/services/worklogs/get-task-worklogs.service';
import { GetWorklogByIdService } from '../../application/services/worklogs/get-worklog-by-id.service';
import { UpdateWorklogService } from '../../application/services/worklogs/update-worklog.service';
import { DeleteWorklogService } from '../../application/services/worklogs/delete-worklog.service';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateWorklogRequestDto } from '../dtos/requests/create-worklog.request.dto';
import { UpdateWorklogRequestDto } from '../dtos/requests/update-worklog.request.dto';

import { WorklogListResponseDto } from '../dtos/responses/worklog-list.response.dto';
import { WorklogResponseDto } from '../dtos/responses/worklog.response.dto';
import { DeleteWorklogResponseDto } from '../dtos/responses/delete-worklog.response.dto';

@Controller('workspaces/:workspaceId/projects/:projectId/tasks/:taskId/worklogs')
export class WorklogController {
    constructor(
        private readonly createWorklogService: CreateWorklogService,
        private readonly getTaskWorklogsService: GetTaskWorklogsService,
        private readonly getWorklogByIdService: GetWorklogByIdService,
        private readonly updateWorklogService: UpdateWorklogService,
        private readonly deleteWorklogService: DeleteWorklogService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createWorklog(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Body() dto: CreateWorklogRequestDto,
    ): Promise<WorklogResponseDto> {
        const result = await this.createWorklogService.execute({
            workspaceId,
            projectId,
            taskId,
            userId,
            startedAt: dto.startedAt,
            endedAt: dto.endedAt,
            description: dto.description,
        });

        return WorklogResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getTaskWorklogs(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
    ): Promise<WorklogListResponseDto> {
        const result = await this.getTaskWorklogsService.execute({
            workspaceId,
            projectId,
            taskId,
            userId,
        });

        return WorklogListResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':worklogId')
    async getWorklogById(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Param('worklogId') worklogId: string,
    ): Promise<WorklogResponseDto> {
        const result = await this.getWorklogByIdService.execute({
            workspaceId,
            projectId,
            taskId,
            worklogId,
            userId,
        });

        return WorklogResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':worklogId')
    async updateWorklog(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Param('worklogId') worklogId: string,
        @Body() dto: UpdateWorklogRequestDto,
    ): Promise<WorklogResponseDto> {
        const result = await this.updateWorklogService.execute({
            workspaceId,
            projectId,
            taskId,
            worklogId,
            userId,
            startedAt: dto.startedAt,
            endedAt: dto.endedAt,
            description: dto.description,
        });

        return WorklogResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':worklogId')
    async deleteWorklog(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Param('worklogId') worklogId: string,
    ): Promise<DeleteWorklogResponseDto> {
        const result = await this.deleteWorklogService.execute({
            workspaceId,
            projectId,
            taskId,
            worklogId,
            userId,
        });

        return DeleteWorklogResponseDto.fromResult(result);
    }
}
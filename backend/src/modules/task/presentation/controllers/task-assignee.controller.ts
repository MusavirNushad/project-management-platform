import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { AddTaskAssigneeService } from '../../application/services/assignees/add-task-assignee.service';
import { GetTaskAssigneesService } from '../../application/services/assignees/get-task-assignees.service';
import { RemoveTaskAssigneeService } from '../../application/services/assignees/remove-task-assignee.service';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { AddTaskAssigneeRequestDto } from '../dtos/requests/add-task-assignee.request.dto';

import { RemoveTaskAssigneeResponseDto } from '../dtos/responses/remove-task-assignee.response.dto';
import { TaskAssigneeListResponseDto } from '../dtos/responses/task-assignee-list.response.dto';
import { TaskAssigneeResponseDto } from '../dtos/responses/task-assignee.response.dto';

@Controller('workspaces/:workspaceId/projects/:projectId/tasks/:taskId/assignees')
export class TaskAssigneeController {
    constructor(
        private readonly addTaskAssigneeService: AddTaskAssigneeService,
        private readonly getTaskAssigneesService: GetTaskAssigneesService,
        private readonly removeTaskAssigneeService: RemoveTaskAssigneeService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addTaskAssignee(
        @CurrentUser('userId') actorUserId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Body() dto: AddTaskAssigneeRequestDto,
    ): Promise<TaskAssigneeResponseDto> {
        const result = await this.addTaskAssigneeService.execute({
            workspaceId,
            projectId,
            taskId,
            actorUserId,
            targetUserId: dto.userId,
        });

        return TaskAssigneeResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getTaskAssignees(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
    ): Promise<TaskAssigneeListResponseDto> {
        const result = await this.getTaskAssigneesService.execute({
            workspaceId,
            projectId,
            taskId,
            userId,
        });

        return TaskAssigneeListResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':assigneeId')
    async removeTaskAssignee(
        @CurrentUser('userId') actorUserId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Param('assigneeId') assigneeId: string,
    ): Promise<RemoveTaskAssigneeResponseDto> {
        const result = await this.removeTaskAssigneeService.execute({
            workspaceId,
            projectId,
            taskId,
            assigneeId,
            actorUserId,
        });

        return RemoveTaskAssigneeResponseDto.fromResult(result);
    }
}
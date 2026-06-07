import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { CreateTaskService } from '../../application/services/tasks/create-task.service';
import { GetProjectTasksService } from '../../application/services/tasks/get-project-tasks.service';
import { UpdateTaskService } from '../../application/services/tasks/update-task.service';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateTaskRequestDto } from '../dtos/requests/create-task.request.dto';
import { UpdateTaskRequestDto } from '../dtos/requests/update-task.request.dto';

import { TaskListResponseDto } from '../dtos/responses/task-list.response.dto';
import { TaskResponseDto } from '../dtos/responses/task.response.dto';

@Controller('workspaces/:workspaceId/projects/:projectId/tasks')
export class TaskController {
    constructor(
        private readonly createTaskService: CreateTaskService,
        private readonly getProjectTasksService: GetProjectTasksService,
        private readonly updateTaskService: UpdateTaskService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createTask(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Body() dto: CreateTaskRequestDto,
    ): Promise<TaskResponseDto> {
        const result = await this.createTaskService.execute({
            workspaceId,
            projectId,
            reporterId: userId,
            title: dto.title,
            description: dto.description,
            priority: dto.priority,
            startDate: dto.startDate,
            dueDate: dto.dueDate,
        });

        return TaskResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getProjectTasks(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
    ): Promise<TaskListResponseDto> {
        const result = await this.getProjectTasksService.execute({
            workspaceId,
            projectId,
            userId,
        });

        return TaskListResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':taskId')
    async updateTask(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateTaskRequestDto,
    ): Promise<TaskResponseDto> {
        const result = await this.updateTaskService.execute({
            workspaceId,
            projectId,
            taskId,
            userId,
            title: dto.title,
            description: dto.description,
            status: dto.status,
            priority: dto.priority,
            startDate: dto.startDate,
            dueDate: dto.dueDate,
        });

        return TaskResponseDto.fromResult(result);
    }
}
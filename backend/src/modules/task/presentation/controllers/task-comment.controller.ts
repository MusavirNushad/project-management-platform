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

import { CreateTaskCommentService } from '../../application/services/comments/create-task-comment.service';
import { DeleteTaskCommentService } from '../../application/services/comments/delete-task-comment.service';
import { GetTaskCommentsService } from '../../application/services/comments/get-task-comments.service';
import { UpdateTaskCommentService } from '../../application/services/comments/update-task-comment.service';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateTaskCommentRequestDto } from '../dtos/requests/create-task-comment.request.dto';
import { UpdateTaskCommentRequestDto } from '../dtos/requests/update-task-comment.request.dto';

import { DeleteTaskCommentResponseDto } from '../dtos/responses/delete-task-comment.response.dto';
import { TaskCommentListResponseDto } from '../dtos/responses/task-comment-list.response.dto';
import { TaskCommentResponseDto } from '../dtos/responses/task-comment.response.dto';

@Controller('workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments')
export class TaskCommentController {
    constructor(
        private readonly createTaskCommentService: CreateTaskCommentService,
        private readonly getTaskCommentsService: GetTaskCommentsService,
        private readonly updateTaskCommentService: UpdateTaskCommentService,
        private readonly deleteTaskCommentService: DeleteTaskCommentService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createTaskComment(
        @CurrentUser('userId') authorId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Body() dto: CreateTaskCommentRequestDto,
    ): Promise<TaskCommentResponseDto> {
        const result = await this.createTaskCommentService.execute({
            workspaceId,
            projectId,
            taskId,
            authorId,
            body: dto.body,
            parentCommentId: dto.parentCommentId,
        });

        return TaskCommentResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getTaskComments(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
    ): Promise<TaskCommentListResponseDto> {
        const result = await this.getTaskCommentsService.execute({
            workspaceId,
            projectId,
            taskId,
            userId,
        });

        return TaskCommentListResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':commentId')
    async updateTaskComment(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateTaskCommentRequestDto,
    ): Promise<TaskCommentResponseDto> {
        const result = await this.updateTaskCommentService.execute({
            workspaceId,
            projectId,
            taskId,
            commentId,
            userId,
            body: dto.body,
        });

        return TaskCommentResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    async deleteTaskComment(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Param('commentId') commentId: string,
    ): Promise<DeleteTaskCommentResponseDto> {
        const result = await this.deleteTaskCommentService.execute({
            workspaceId,
            projectId,
            taskId,
            commentId,
            userId,
        });

        return DeleteTaskCommentResponseDto.fromResult(result);
    }
}

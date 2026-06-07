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

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateProjectRequestDto } from '../dtos/requests/create-project.request.dto';
import { UpdateProjectRequestDto } from '../dtos/requests/update-project.request.dto';

import { ProjectListResponseDto } from '../dtos/responses/project-list.response.dto';
import { ProjectResponseDto } from '../dtos/responses/project.response.dto';

@Controller('workspaces/:workspaceId/projects')
export class ProjectController {
    constructor(
        private readonly createProjectService: CreateProjectService,
        private readonly getWorkspaceProjectsService: GetWorkspaceProjectsService,
        private readonly getProjectByIdService: GetProjectByIdService,
        private readonly updateProjectService: UpdateProjectService,
    ) { }

    @UseGuards(JwtAuthGuard)
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

    @UseGuards(JwtAuthGuard)
    @Get()
    async getWorkspaceProjects(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
    ): Promise<ProjectListResponseDto> {
        const result = await this.getWorkspaceProjectsService.execute({
            workspaceId,
            userId,
        });

        return ProjectListResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':projectId')
    async getProjectById(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
    ): Promise<ProjectResponseDto> {
        const result = await this.getProjectByIdService.execute({
            workspaceId,
            projectId,
            userId,
        });

        return ProjectResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':projectId')
    async updateProject(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Body() dto: UpdateProjectRequestDto,
    ): Promise<ProjectResponseDto> {
        const result = await this.updateProjectService.execute({
            workspaceId,
            projectId,
            userId,
            title: dto.title,
            description: dto.description,
            startDate: dto.startDate,
            dueDate: dto.dueDate,
            status: dto.status,
        });

        return ProjectResponseDto.fromResult(result);
    }
}
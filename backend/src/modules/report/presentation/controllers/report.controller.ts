import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { CreateReportService } from '../../application/services/reports/create-report.service';
import { GetProjectReportsService } from '../../application/services/reports/get-project-reports.service';
import { GetReportByIdService } from '../../application/services/reports/get-report-by-id.service';

import { CurrentUser } from '../../../identity/infrastructure/security/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/infrastructure/security/jwt-auth.guard';

import { CreateReportRequestDto } from '../dtos/requests/create-report.request.dto';

import { ReportListResponseDto } from '../dtos/responses/report-list.response.dto';
import { ReportWithSummaryResponseDto } from '../dtos/responses/report-with-summary.response.dto';

@Controller('workspaces/:workspaceId/projects/:projectId/reports')
export class ReportController {
    constructor(
        private readonly createReportService: CreateReportService,
        private readonly getProjectReportsService: GetProjectReportsService,
        private readonly getReportByIdService: GetReportByIdService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createReport(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Body() dto: CreateReportRequestDto,
    ): Promise<ReportWithSummaryResponseDto> {
        const result = await this.createReportService.execute({
            workspaceId,
            projectId,
            userId,
            name: dto.name,
            startDate: dto.startDate,
            endDate: dto.endDate,
        });

        return ReportWithSummaryResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getProjectReports(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
    ): Promise<ReportListResponseDto> {
        const result = await this.getProjectReportsService.execute({
            workspaceId,
            projectId,
            userId,
        });

        return ReportListResponseDto.fromResult(result);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':reportId')
    async getReportById(
        @CurrentUser('userId') userId: string,
        @Param('workspaceId') workspaceId: string,
        @Param('projectId') projectId: string,
        @Param('reportId') reportId: string,
    ): Promise<ReportWithSummaryResponseDto> {
        const result = await this.getReportByIdService.execute({
            workspaceId,
            projectId,
            reportId,
            userId,
        });

        return ReportWithSummaryResponseDto.fromResult(result);
    }
}

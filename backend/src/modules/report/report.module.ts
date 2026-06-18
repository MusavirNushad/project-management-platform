import { Module } from '@nestjs/common';

import { AccessControlModule } from '../access-control/access-control.module';
import { IdentityModule } from '../identity/identity.module';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';

import { CreateReportService } from './application/services/reports/create-report.service';
import { GenerateReportSummaryService } from './application/services/reports/generate-report-summary.service';
import { GetProjectReportsService } from './application/services/reports/get-project-reports.service';
import { GetReportByIdService } from './application/services/reports/get-report-by-id.service';

import { REPORT_REPOSITORY } from './domain/ports/report.repository.port';

import { PrismaReportRepository } from './infrastructure/database/prisma-report.repository';

import { ReportController } from './presentation/controllers/report.controller';

@Module({
  imports: [PrismaModule, IdentityModule, AccessControlModule],
  controllers: [ReportController],
  providers: [
    GenerateReportSummaryService,
    CreateReportService,
    GetProjectReportsService,
    GetReportByIdService,
    {
      provide: REPORT_REPOSITORY,
      useClass: PrismaReportRepository,
    },
  ],
})
export class ReportModule { }
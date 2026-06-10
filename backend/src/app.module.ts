// src/app.module.ts

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RequestLoggingMiddleware } from './shared/infrastructure/middlewares/request-logging.middleware';


import { IdentityModule } from './modules/identity/identity.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { SprintModule } from './modules/sprint/sprint.module';
import { WorklogModule } from './modules/worklog/worklog.module';
import { ReportModule } from './modules/report/report.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    IdentityModule,
    AccessControlModule,
    WorkspaceModule,
    ProjectModule,
    TaskModule,
    SprintModule,
    WorklogModule,
    ReportModule,

  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}

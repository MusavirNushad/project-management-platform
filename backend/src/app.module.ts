// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IdentityModule } from './modules/identity/identity.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { SprintModule } from './modules/sprint/sprint.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    IdentityModule,
    WorkspaceModule,
    ProjectModule,
    TaskModule,
    SprintModule,
  ],
})
export class AppModule { }

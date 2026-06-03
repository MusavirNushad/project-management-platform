// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IdentityModule } from './modules/identity/identity.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    IdentityModule,
    WorkspaceModule,
  ],
})
export class AppModule { }
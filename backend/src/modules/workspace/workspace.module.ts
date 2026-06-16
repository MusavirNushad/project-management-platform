import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { SocketAuthenticationService } from '../../shared/infrastructure/realtime/services/socket-authentication.service';


import { IdentityModule } from '../identity/identity.module';

import { CreateWorkspaceService } from './application/services/workspaces/create-workspace.service';
import { GetMyWorkspacesService } from './application/services/workspaces/get-my-workspaces.service';
import { GetWorkspaceByIdService } from './application/services/workspaces/get-workspace-by-id.service';
import { UpdateWorkspaceService } from './application/services/workspaces/update-workspace.service';

import { GetWorkspaceMembersService } from './application/services/members/get-workspace-members.service';
import { AddWorkspaceMemberService } from './application/services/members/add-workspace-member.service';
import { RemoveWorkspaceMemberService } from './application/services/members/remove-workspace-member.service';

import { WorkspaceRealtimeAccessService } from "./application/services/workspace-realtime/workspace-realtime-access.service";
import { WorkspaceRealtimeEventsService } from "./application/services/workspace-realtime/workspace-realtime-events.service";

import { WORKSPACE_REPOSITORY } from './domain/ports/workspace.repository.port';

import { PrismaWorkspaceRepository } from './infrastructure/database/prisma-workspace.repository';

import { WorkspaceController } from './presentation/controllers/workspace.controller';
import { WorkspaceMemberController } from './presentation/controllers/workspace-member.controller';
import { WorkspaceRealtimeGateway } from './presentation/gateways/workspace-realtime.gateway';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [WorkspaceController, WorkspaceMemberController],
  providers: [
    SocketAuthenticationService,
    CreateWorkspaceService,
    GetMyWorkspacesService,
    GetWorkspaceByIdService,
    UpdateWorkspaceService,

    GetWorkspaceMembersService,
    AddWorkspaceMemberService,
    RemoveWorkspaceMemberService,

    WorkspaceRealtimeGateway,
    WorkspaceRealtimeAccessService,
    WorkspaceRealtimeEventsService,
    {
      provide: WORKSPACE_REPOSITORY,
      useClass: PrismaWorkspaceRepository,
    },
  ],
})
export class WorkspaceModule { }

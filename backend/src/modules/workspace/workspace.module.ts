import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { IdentityModule } from '../identity/identity.module';

import { CreateWorkspaceService } from './application/services/workspaces/create-workspace.service';
import { GetMyWorkspacesService } from './application/services/workspaces/get-my-workspaces.service';
import { GetWorkspaceByIdService } from './application/services/workspaces/get-workspace-by-id.service';
import { UpdateWorkspaceService } from './application/services/workspaces/update-workspace.service';
import { GetWorkspaceMembersService } from './application/services/members/get-workspace-members.service';
import { AddWorkspaceMemberService } from './application/services/members/add-workspace-member.service';
import { RemoveWorkspaceMemberService } from './application/services/members/remove-workspace-member.service';

import { WORKSPACE_REPOSITORY } from './domain/ports/workspace.repository.port';

import { PrismaWorkspaceRepository } from './infrastructure/database/prisma-workspace.repository';

import { WorkspaceController } from './presentation/controllers/workspace.controller';
import { WorkspaceMemberController } from './presentation/controllers/workspace-member.controller';

@Module({
    imports: [PrismaModule, IdentityModule],
    controllers: [WorkspaceController, WorkspaceMemberController],
    providers: [
        CreateWorkspaceService,
        GetMyWorkspacesService,
        GetWorkspaceByIdService,
        UpdateWorkspaceService,

        GetWorkspaceMembersService,
        AddWorkspaceMemberService,
        RemoveWorkspaceMemberService,
        {
            provide: WORKSPACE_REPOSITORY,
            useClass: PrismaWorkspaceRepository,
        },
    ],
})
export class WorkspaceModule { }
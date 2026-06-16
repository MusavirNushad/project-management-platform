import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { IdentityModule } from '../identity/identity.module';

import { ProjectRealtimeAccessService } from './application/services/realtime/project-realtime-access.service';
import { ProjectRealtimeEventsService } from './application/services/realtime/project-realtime-events.service';
import { ProjectRealtimeGateway } from './presentation/gateways/project-realtime.gateway';

import { AddProjectMemberService } from './application/services/members/add-project-member.service';
import { GetProjectMembersService } from './application/services/members/get-project-members.service';
import { ProjectMemberPermissionService } from './application/services/members/project-member-permission.service';
import { RemoveProjectMemberService } from './application/services/members/remove-project-member.service';
import { UpdateProjectMemberRoleService } from './application/services/members/update-project-member-role.service';
import { CreateProjectService } from './application/services/projects/create-project.service';
import { GetProjectByIdService } from './application/services/projects/get-project-by-id.service';
import { GetWorkspaceProjectsService } from './application/services/projects/get-workspace-projects.service';
import { UpdateProjectService } from './application/services/projects/update-project.service';

import { PROJECT_REPOSITORY } from './domain/ports/project.repository.port';

import { PrismaProjectRepository } from './infrastructure/database/prisma-project.repository';

import { ProjectMemberController } from './presentation/controllers/project-member.controller';
import { ProjectController } from './presentation/controllers/project.controller';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [ProjectController, ProjectMemberController],
  providers: [
    CreateProjectService,
    GetWorkspaceProjectsService,
    GetProjectByIdService,
    UpdateProjectService,

    ProjectRealtimeGateway,
    ProjectRealtimeAccessService,
    ProjectRealtimeEventsService,

    GetProjectMembersService,
    ProjectMemberPermissionService,
    AddProjectMemberService,
    UpdateProjectMemberRoleService,
    RemoveProjectMemberService,

    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
  ],
})
export class ProjectModule { }

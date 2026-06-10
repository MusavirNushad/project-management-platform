// src/modules/access-control/presentation/decorators/project-roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

import type { ProjectRoleName } from '../../application/types/access-control.types';

export const PROJECT_ROLES_KEY = 'project_roles';

export const ProjectRoles = (...roles: ProjectRoleName[]) =>
    SetMetadata(PROJECT_ROLES_KEY, roles);
import { SetMetadata } from '@nestjs/common';

import type { WorkspaceRoleName } from '../../application/types/access-control.types';

export const WORKSPACE_ROLES_KEY = 'workspace_roles';

export const WorkspaceRoles = (...roles: WorkspaceRoleName[]) =>
    SetMetadata(WORKSPACE_ROLES_KEY, roles);
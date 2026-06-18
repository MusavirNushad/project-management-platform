import { SetMetadata } from '@nestjs/common';

import type { RequireRolesMetadata } from '../../application/types/access-control.types';

export const REQUIRE_ROLES_KEY = 'require_roles';

export const RequireRoles = (metadata: RequireRolesMetadata) =>
  SetMetadata(REQUIRE_ROLES_KEY, metadata);
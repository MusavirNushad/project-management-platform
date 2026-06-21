import { IsEmail, IsIn, IsUUID } from 'class-validator';

import type { WorkspaceAssignableRoleName } from '../../../domain/ports/workspace.repository.port';

export class AddWorkspaceMemberSocketDto {
    @IsUUID()
    workspaceId!: string;

    @IsEmail()
    email!: string;

    @IsIn(['ADMIN', 'MEMBER'])
    roleName!: WorkspaceAssignableRoleName;
}
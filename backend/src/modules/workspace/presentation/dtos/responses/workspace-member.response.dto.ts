import type { AddWorkspaceMemberResult } from '../../../application/services/members/add-workspace-member.service';

export class WorkspaceMemberUserResponseDto {
    id!: string;
    name!: string;
    email!: string;
}

export class WorkspaceMemberRoleResponseDto {
    id!: string;
    name!: string;
}

export class WorkspaceMemberResponseDto {
    id!: string;
    workspaceId!: string;
    userId!: string;
    user!: WorkspaceMemberUserResponseDto;
    role!: WorkspaceMemberRoleResponseDto;
    joinedAt!: Date;

    static fromResult(result: AddWorkspaceMemberResult): WorkspaceMemberResponseDto {
        return {
            id: result.id,
            workspaceId: result.workspaceId,
            userId: result.userId,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
            },
            role: {
                id: result.role.id,
                name: result.role.name,
            },
            joinedAt: result.joinedAt,
        };
    }
}
import type {
    GetProjectMembersResult,
    ProjectMemberListItemResult,
} from '../../../application/services/members/get-project-members.service';

export class ProjectMemberListUserResponseDto {
    id!: string;
    name!: string;
    email!: string;
}

export class ProjectMemberListRoleResponseDto {
    id!: string;
    name!: string;
}

export class ProjectMemberListItemResponseDto {
    id!: string;
    projectId!: string;
    userId!: string;
    user!: ProjectMemberListUserResponseDto;
    role!: ProjectMemberListRoleResponseDto;
    joinedAt!: Date;

    static fromResult(
        result: ProjectMemberListItemResult,
    ): ProjectMemberListItemResponseDto {
        return {
            id: result.id,
            projectId: result.projectId,
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

export class ProjectMemberListResponseDto {
    items!: ProjectMemberListItemResponseDto[];
    total!: number;

    static fromResult(
        result: GetProjectMembersResult,
    ): ProjectMemberListResponseDto {
        return {
            items: result.items.map(ProjectMemberListItemResponseDto.fromResult),
            total: result.total,
        };
    }
}

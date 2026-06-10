import type { AddProjectMemberResult } from '../../../application/services/members/add-project-member.service';
import type { UpdateProjectMemberRoleResult } from '../../../application/services/members/update-project-member-role.service';

type ProjectMemberServiceResult = AddProjectMemberResult;

export class ProjectMemberUserResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

export class ProjectMemberRoleResponseDto {
  id!: string;
  name!: string;
}

export class ProjectMemberResponseDto {
  id!: string;
  projectId!: string;
  userId!: string;
  user!: ProjectMemberUserResponseDto;
  role!: ProjectMemberRoleResponseDto;
  joinedAt!: Date;

  static fromResult(
    result: ProjectMemberServiceResult,
  ): ProjectMemberResponseDto {
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

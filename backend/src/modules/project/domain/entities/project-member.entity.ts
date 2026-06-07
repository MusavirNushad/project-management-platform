import { ProjectId } from '../value-objects/project-id.vo';
import { ProjectMemberId } from '../value-objects/project-member-id.vo';
import { RoleId } from '../value-objects/role-id.vo';
import { UserId } from '../value-objects/user-id.vo';

type ProjectMemberEntityProps = {
    id: ProjectMemberId;
    projectId: ProjectId;
    userId: UserId;
    roleId: RoleId;
    joinedAt: Date;
};

type CreateProjectMemberProps = {
    id: ProjectMemberId;
    projectId: ProjectId;
    userId: UserId;
    roleId: RoleId;
    joinedAt?: Date;
};

type RestoreProjectMemberProps = {
    id: ProjectMemberId;
    projectId: ProjectId;
    userId: UserId;
    roleId: RoleId;
    joinedAt: Date;
};

export class ProjectMemberEntity {
    private constructor(private readonly props: ProjectMemberEntityProps) { }

    static create(props: CreateProjectMemberProps): ProjectMemberEntity {
        return new ProjectMemberEntity({
            id: props.id,
            projectId: props.projectId,
            userId: props.userId,
            roleId: props.roleId,
            joinedAt: props.joinedAt ?? new Date(),
        });
    }

    static restore(props: RestoreProjectMemberProps): ProjectMemberEntity {
        return new ProjectMemberEntity({
            id: props.id,
            projectId: props.projectId,
            userId: props.userId,
            roleId: props.roleId,
            joinedAt: props.joinedAt,
        });
    }

    belongsToUser(userId: UserId): boolean {
        return this.props.userId.equals(userId);
    }

    belongsToProject(projectId: ProjectId): boolean {
        return this.props.projectId.equals(projectId);
    }

    changeRole(roleId: RoleId): void {
        this.props.roleId = roleId;
    }

    getId(): string {
        return this.props.id.value;
    }

    getProjectId(): string {
        return this.props.projectId.value;
    }

    getUserId(): string {
        return this.props.userId.value;
    }

    getUserIdValueObject(): UserId {
        return this.props.userId;
    }

    getRoleId(): string {
        return this.props.roleId.value;
    }

    getJoinedAt(): Date {
        return this.props.joinedAt;
    }
}

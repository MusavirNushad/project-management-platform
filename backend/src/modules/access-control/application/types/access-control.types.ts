export type WorkspaceRoleName = 'OWNER' | 'ADMIN' | 'MEMBER';

export type ProjectRoleName = 'ADMIN' | 'MEMBER';

export type AccessControlScope = 'workspace' | 'project';

export type RequireWorkspaceRolesMetadata = {
    scope: 'workspace';
    roles: WorkspaceRoleName[];
};

export type RequireProjectRolesMetadata = {
    scope: 'project';
    roles: ProjectRoleName[];
    allowWorkspaceOwner?: boolean;
};

export type RequireRolesMetadata =
    | RequireWorkspaceRolesMetadata
    | RequireProjectRolesMetadata;
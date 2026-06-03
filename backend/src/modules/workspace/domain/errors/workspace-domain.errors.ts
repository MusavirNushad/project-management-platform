// src/modules/workspace/domain/errors/workspace-domain.errors.ts

export abstract class WorkspaceDomainError extends Error {
    protected constructor(message: string) {
        super(message);

        this.name = new.target.name;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidWorkspaceIdError extends WorkspaceDomainError {
    constructor() {
        super('Invalid workspace id.');
    }
}

export class InvalidWorkspaceMemberIdError extends WorkspaceDomainError {
    constructor() {
        super('Invalid workspace member id.');
    }
}

export class InvalidWorkspaceUserIdError extends WorkspaceDomainError {
    constructor() {
        super('Invalid workspace user id.');
    }
}

export class InvalidWorkspaceRoleIdError extends WorkspaceDomainError {
    constructor() {
        super('Invalid workspace role id.');
    }
}

export class InvalidWorkspaceNameError extends WorkspaceDomainError {
    constructor(reason: string) {
        super(`Invalid workspace name: ${reason}`);
    }
}

export class InvalidWorkspaceSlugError extends WorkspaceDomainError {
    constructor(reason: string) {
        super(`Invalid workspace slug: ${reason}`);
    }
}

export class InvalidWorkspaceDescriptionError extends WorkspaceDomainError {
    constructor(reason: string) {
        super(`Invalid workspace description: ${reason}`);
    }
}

export class WorkspaceAlreadyExistsError extends WorkspaceDomainError {
    constructor() {
        super('Workspace already exists.');
    }
}

export class WorkspaceNotFoundError extends WorkspaceDomainError {
    constructor() {
        super('Workspace not found.');
    }
}

export class WorkspaceAccessDeniedError extends WorkspaceDomainError {
    constructor() {
        super('You do not have access to this workspace.');
    }
}

export class WorkspaceOwnerRoleNotFoundError extends WorkspaceDomainError {
    constructor() {
        super('Workspace owner role was not found.');
    }
}

export class WorkspaceMemberAlreadyExistsError extends WorkspaceDomainError {
    constructor() {
        super('User is already a member of this workspace.');
    }
}

export class WorkspaceMemberUserNotFoundError extends WorkspaceDomainError {
    constructor() {
        super('Workspace member user was not found.');
    }
}

export class WorkspaceRoleNotFoundError extends WorkspaceDomainError {
    constructor() {
        super('Workspace role was not found.');
    }
}

export class WorkspaceMemberNotFoundError extends WorkspaceDomainError {
    constructor() {
        super('Workspace member was not found.');
    }
}

export class WorkspaceMemberWorkspaceMismatchError extends WorkspaceDomainError {
    constructor() {
        super('Workspace member does not belong to this workspace.');
    }
}

export class WorkspaceOwnerCannotBeRemovedError extends WorkspaceDomainError {
    constructor() {
        super('Workspace owner cannot be removed.');
    }
}
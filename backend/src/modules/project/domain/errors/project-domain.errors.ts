export abstract class ProjectDomainError extends Error {
    protected constructor(message: string) {
        super(message);

        this.name = new.target.name;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidProjectIdError extends ProjectDomainError {
    constructor() {
        super('Invalid project id.');
    }
}

export class InvalidProjectMemberIdError extends ProjectDomainError {
    constructor() {
        super('Invalid project member id.');
    }
}

export class InvalidProjectWorkspaceIdError extends ProjectDomainError {
    constructor() {
        super('Invalid project workspace id.');
    }
}

export class InvalidProjectUserIdError extends ProjectDomainError {
    constructor() {
        super('Invalid project user id.');
    }
}

export class InvalidProjectRoleIdError extends ProjectDomainError {
    constructor() {
        super('Invalid project role id.');
    }
}

export class InvalidProjectTitleError extends ProjectDomainError {
    constructor(reason: string) {
        super(`Invalid project title: ${reason}`);
    }
}

export class InvalidProjectDescriptionError extends ProjectDomainError {
    constructor(reason: string) {
        super(`Invalid project description: ${reason}`);
    }
}

export class InvalidProjectDateRangeError extends ProjectDomainError {
    constructor() {
        super('Project start date cannot be after due date.');
    }
}

export class InvalidProjectStatusError extends ProjectDomainError {
    constructor() {
        super('Invalid project status.');
    }
}

export class ProjectNotFoundError extends ProjectDomainError {
    constructor() {
        super('Project not found.');
    }
}

export class ProjectWorkspaceNotFoundError extends ProjectDomainError {
    constructor() {
        super('Workspace not found.');
    }
}

export class ProjectAccessDeniedError extends ProjectDomainError {
    constructor() {
        super('You do not have access to this project.');
    }
}

export class ProjectWorkspaceAccessDeniedError extends ProjectDomainError {
    constructor() {
        super('You do not have access to this workspace.');
    }
}

export class ProjectWorkspaceMismatchError extends ProjectDomainError {
    constructor() {
        super('Project does not belong to this workspace.');
    }
}

export class ProjectMemberAlreadyExistsError extends ProjectDomainError {
    constructor() {
        super('User is already a member of this project.');
    }
}

export class ProjectMemberNotFoundError extends ProjectDomainError {
    constructor() {
        super('Project member was not found.');
    }
}

export class ProjectMemberUserNotFoundError extends ProjectDomainError {
    constructor() {
        super('User was not found.');
    }
}

export class ProjectMemberProjectMismatchError extends ProjectDomainError {
    constructor() {
        super('Project member does not belong to this project.');
    }
}

export class ProjectCreatorCannotBeRemovedError extends ProjectDomainError {
    constructor() {
        super('Project creator cannot be removed.');
    }
}

export class ProjectCreatorRoleNotFoundError extends ProjectDomainError {
    constructor() {
        super('Project creator role was not found.');
    }
}

export class ProjectRoleNotFoundError extends ProjectDomainError {
    constructor() {
        super('Project role was not found.');
    }
}

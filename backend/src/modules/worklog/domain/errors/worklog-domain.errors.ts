export abstract class WorklogDomainError extends Error {
    protected constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidWorklogIdError extends WorklogDomainError {
    constructor() {
        super('Invalid worklog id.');
    }
}

export class InvalidWorklogWorkspaceIdError extends WorklogDomainError {
    constructor() {
        super('Invalid workspace id.');
    }
}

export class InvalidWorklogProjectIdError extends WorklogDomainError {
    constructor() {
        super('Invalid project id.');
    }
}

export class InvalidWorklogTaskIdError extends WorklogDomainError {
    constructor() {
        super('Invalid task id.');
    }
}

export class InvalidWorklogUserIdError extends WorklogDomainError {
    constructor() {
        super('Invalid user id.');
    }
}

export class InvalidWorklogDescriptionError extends WorklogDomainError {
    constructor() {
        super('Invalid worklog description.');
    }
}

export class InvalidWorklogDateRangeError extends WorklogDomainError {
    constructor() {
        super('Worklog end time must be after start time.');
    }
}

export class WorklogWorkspaceNotFoundError extends WorklogDomainError {
    constructor() {
        super('Workspace not found.');
    }
}

export class WorklogProjectNotFoundError extends WorklogDomainError {
    constructor() {
        super('Project not found.');
    }
}

export class WorklogTaskNotFoundError extends WorklogDomainError {
    constructor() {
        super('Task not found.');
    }
}

export class WorklogNotFoundError extends WorklogDomainError {
    constructor() {
        super('Worklog not found.');
    }
}

export class WorklogAccessDeniedError extends WorklogDomainError {
    constructor() {
        super('You do not have access to this worklog.');
    }
}

export class WorklogProjectAccessDeniedError extends WorklogDomainError {
    constructor() {
        super('You do not have access to this project.');
    }
}

export class WorklogTaskMismatchError extends WorklogDomainError {
    constructor() {
        super('Worklog does not belong to this task.');
    }
}
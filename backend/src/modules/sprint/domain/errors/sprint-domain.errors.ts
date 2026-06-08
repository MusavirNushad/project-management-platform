export abstract class SprintDomainError extends Error {
    protected constructor(message: string) {
        super(message);

        this.name = new.target.name;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidSprintIdError extends SprintDomainError {
    constructor() {
        super('Invalid sprint id.');
    }
}

export class InvalidSprintTaskIdError extends SprintDomainError {
    constructor() {
        super('Invalid sprint task id.');
    }
}

export class InvalidSprintWorkspaceIdError extends SprintDomainError {
    constructor() {
        super('Invalid workspace id.');
    }
}

export class InvalidSprintProjectIdError extends SprintDomainError {
    constructor() {
        super('Invalid project id.');
    }
}

export class InvalidSprintUserIdError extends SprintDomainError {
    constructor() {
        super('Invalid user id.');
    }
}

export class InvalidSprintNameError extends SprintDomainError {
    constructor(reason: string) {
        super(`Invalid sprint name: ${reason}`);
    }
}

export class InvalidSprintGoalError extends SprintDomainError {
    constructor(reason: string) {
        super(`Invalid sprint goal: ${reason}`);
    }
}

export class InvalidSprintStatusError extends SprintDomainError {
    constructor() {
        super('Invalid sprint status.');
    }
}

export class InvalidSprintDateRangeError extends SprintDomainError {
    constructor() {
        super('Sprint start date cannot be after end date.');
    }
}

export class SprintWorkspaceNotFoundError extends SprintDomainError {
    constructor() {
        super('Workspace not found.');
    }
}

export class SprintProjectNotFoundError extends SprintDomainError {
    constructor() {
        super('Project not found.');
    }
}

export class SprintNotFoundError extends SprintDomainError {
    constructor() {
        super('Sprint not found.');
    }
}

export class SprintAccessDeniedError extends SprintDomainError {
    constructor() {
        super('You do not have access to this sprint.');
    }
}

export class SprintProjectAccessDeniedError extends SprintDomainError {
    constructor() {
        super('You do not have access to this project.');
    }
}

export class SprintProjectMismatchError extends SprintDomainError {
    constructor() {
        super('Sprint does not belong to this project.');
    }
}

export class SprintTaskReferenceNotFoundError extends SprintDomainError {
    constructor() {
        super('Task was not found in this project.');
    }
}

export class TaskAlreadyInActiveSprintError extends SprintDomainError {
    constructor() {
        super('Task is already in an active sprint.');
    }
}

export class SprintCannotAcceptTasksError extends SprintDomainError {
    constructor() {
        super('Tasks can only be added to planned or active sprints.');
    }
}

export class InvalidSprintTaskPositionError extends SprintDomainError {
    constructor() {
        super('Invalid sprint task position.');
    }
}

export class SprintTaskNotFoundError extends SprintDomainError {
    constructor() {
        super('Sprint task not found.');
    }
}

export class SprintTaskSprintMismatchError extends SprintDomainError {
    constructor() {
        super('Sprint task does not belong to this sprint.');
    }
}

export class SprintTaskAlreadyRemovedError extends SprintDomainError {
    constructor() {
        super('Task is already removed from this sprint.');
    }
}

export class SprintCannotRemoveTasksError extends SprintDomainError {
    constructor() {
        super('Tasks can only be removed from planned or active sprints.');
    }
}
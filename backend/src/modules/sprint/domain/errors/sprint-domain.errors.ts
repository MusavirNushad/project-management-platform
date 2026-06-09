
import {
    DomainError,
    DomainErrorType,
} from '../../../../shared/domain/errors/domain-error';

export abstract class SprintDomainError extends DomainError {
    protected constructor(
        message: string,
        type: DomainErrorType,
        safeMessage = message,
    ) {
        super(message, type, safeMessage);
    }
}

export class InvalidSprintIdError extends SprintDomainError {
    constructor() {
        super('Invalid sprint id.', 'BAD_REQUEST');
    }
}

export class InvalidSprintTaskIdError extends SprintDomainError {
    constructor() {
        super('Invalid sprint task id.', 'BAD_REQUEST');
    }
}

export class InvalidSprintWorkspaceIdError extends SprintDomainError {
    constructor() {
        super('Invalid workspace id.', 'BAD_REQUEST');
    }
}

export class InvalidSprintProjectIdError extends SprintDomainError {
    constructor() {
        super('Invalid project id.', 'BAD_REQUEST');
    }
}

export class InvalidSprintUserIdError extends SprintDomainError {
    constructor() {
        super('Invalid user id.', 'BAD_REQUEST');
    }
}

export class InvalidSprintNameError extends SprintDomainError {
    constructor(reason: string) {
        super(`Invalid sprint name: ${reason}`, 'BAD_REQUEST');
    }
}

export class InvalidSprintGoalError extends SprintDomainError {
    constructor(reason: string) {
        super(`Invalid sprint goal: ${reason}`, 'BAD_REQUEST');
    }
}

export class InvalidSprintStatusError extends SprintDomainError {
    constructor() {
        super('Invalid sprint status.', 'BAD_REQUEST');
    }
}

export class InvalidSprintDateRangeError extends SprintDomainError {
    constructor() {
        super('Sprint start date cannot be after end date.', 'BAD_REQUEST');
    }
}

export class SprintWorkspaceNotFoundError extends SprintDomainError {
    constructor() {
        super('Workspace not found.', 'NOT_FOUND');
    }
}

export class SprintProjectNotFoundError extends SprintDomainError {
    constructor() {
        super('Project not found.', 'NOT_FOUND');
    }
}

export class SprintNotFoundError extends SprintDomainError {
    constructor() {
        super('Sprint not found.', 'NOT_FOUND');
    }
}

export class SprintAccessDeniedError extends SprintDomainError {
    constructor() {
        super('You do not have access to this sprint.', 'FORBIDDEN');
    }
}

export class SprintProjectAccessDeniedError extends SprintDomainError {
    constructor() {
        super('You do not have access to this project.', 'FORBIDDEN');
    }
}

export class SprintProjectMismatchError extends SprintDomainError {
    constructor() {
        super('Sprint does not belong to this project.', 'BAD_REQUEST');
    }
}

export class SprintTaskReferenceNotFoundError extends SprintDomainError {
    constructor() {
        super('Task was not found in this project.', 'NOT_FOUND');
    }
}

export class TaskAlreadyInActiveSprintError extends SprintDomainError {
    constructor() {
        super('Task is already in an active sprint.', 'CONFLICT');
    }
}

export class SprintCannotAcceptTasksError extends SprintDomainError {
    constructor() {
        super('Tasks can only be added to planned or active sprints.', 'BAD_REQUEST');
    }
}

export class InvalidSprintTaskPositionError extends SprintDomainError {
    constructor() {
        super('Invalid sprint task position.', 'BAD_REQUEST');
    }
}

export class SprintTaskNotFoundError extends SprintDomainError {
    constructor() {
        super('Sprint task not found.', 'NOT_FOUND');
    }
}

export class SprintTaskSprintMismatchError extends SprintDomainError {
    constructor() {
        super('Sprint task does not belong to this sprint.', 'BAD_REQUEST');
    }
}

export class SprintTaskAlreadyRemovedError extends SprintDomainError {
    constructor() {
        super('Task is already removed from this sprint.', 'CONFLICT');
    }
}

export class SprintCannotRemoveTasksError extends SprintDomainError {
    constructor() {
        super(
            'Tasks can only be removed from planned or active sprints.',
            'BAD_REQUEST',
        );
    }
}
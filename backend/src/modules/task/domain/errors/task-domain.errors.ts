import {
    DomainError,
    DomainErrorType,
} from '../../../../shared/domain/errors/domain-error';

export abstract class TaskDomainError extends DomainError {
    protected constructor(
        message: string,
        type: DomainErrorType,
        safeMessage = message,
    ) {
        super(message, type, safeMessage);
    }
}

export class InvalidTaskIdError extends TaskDomainError {
    constructor() {
        super('Invalid task id.', 'BAD_REQUEST');
    }
}

export class InvalidTaskAssigneeIdError extends TaskDomainError {
    constructor() {
        super('Invalid task assignee id.', 'BAD_REQUEST');
    }
}

export class InvalidTaskCommentIdError extends TaskDomainError {
    constructor() {
        super('Invalid task comment id.', 'BAD_REQUEST');
    }
}

export class InvalidTaskWorkspaceIdError extends TaskDomainError {
    constructor() {
        super('Invalid workspace id.', 'BAD_REQUEST');
    }
}

export class InvalidTaskProjectIdError extends TaskDomainError {
    constructor() {
        super('Invalid project id.', 'BAD_REQUEST');
    }
}

export class InvalidTaskUserIdError extends TaskDomainError {
    constructor() {
        super('Invalid user id.', 'BAD_REQUEST');
    }
}

export class InvalidTaskTitleError extends TaskDomainError {
    constructor(reason: string) {
        super(`Invalid task title: ${reason}`, 'BAD_REQUEST');
    }
}

export class InvalidTaskDescriptionError extends TaskDomainError {
    constructor(reason: string) {
        super(`Invalid task description: ${reason}`, 'BAD_REQUEST');
    }
}

export class InvalidTaskCommentBodyError extends TaskDomainError {
    constructor(reason: string) {
        super(`Invalid task comment body: ${reason}`, 'BAD_REQUEST');
    }
}

export class InvalidTaskStatusError extends TaskDomainError {
    constructor() {
        super('Invalid task status.', 'BAD_REQUEST');
    }
}

export class InvalidTaskPriorityError extends TaskDomainError {
    constructor() {
        super('Invalid task priority.', 'BAD_REQUEST');
    }
}

export class InvalidTaskDateRangeError extends TaskDomainError {
    constructor() {
        super('Task start date cannot be after due date.', 'BAD_REQUEST');
    }
}

export class TaskWorkspaceNotFoundError extends TaskDomainError {
    constructor() {
        super('Workspace not found.', 'NOT_FOUND');
    }
}

export class TaskProjectNotFoundError extends TaskDomainError {
    constructor() {
        super('Project not found.', 'NOT_FOUND');
    }
}

export class TaskNotFoundError extends TaskDomainError {
    constructor() {
        super('Task not found.', 'NOT_FOUND');
    }
}

export class TaskAccessDeniedError extends TaskDomainError {
    constructor() {
        super('You do not have access to this task.', 'FORBIDDEN');
    }
}

export class TaskProjectAccessDeniedError extends TaskDomainError {
    constructor() {
        super('You do not have access to this project.', 'FORBIDDEN');
    }
}

export class TaskProjectMismatchError extends TaskDomainError {
    constructor() {
        super('Task does not belong to this project.', 'BAD_REQUEST');
    }
}

export class TaskAssigneeAlreadyExistsError extends TaskDomainError {
    constructor() {
        super('User is already assigned to this task.', 'CONFLICT');
    }
}

export class TaskAssigneeNotFoundError extends TaskDomainError {
    constructor() {
        super('Task assignee was not found.', 'NOT_FOUND');
    }
}

export class TaskAssigneeTaskMismatchError extends TaskDomainError {
    constructor() {
        super('Task assignee does not belong to this task.', 'BAD_REQUEST');
    }
}

export class TaskAssigneeUserNotProjectMemberError extends TaskDomainError {
    constructor() {
        super(
            'User must be a project member before being assigned to the task.',
            'BAD_REQUEST',
        );
    }
}

export class TaskCommentNotFoundError extends TaskDomainError {
    constructor() {
        super('Task comment was not found.', 'NOT_FOUND');
    }
}

export class TaskCommentTaskMismatchError extends TaskDomainError {
    constructor() {
        super('Task comment does not belong to this task.', 'BAD_REQUEST');
    }
}

export class TaskCommentAccessDeniedError extends TaskDomainError {
    constructor() {
        super('You do not have access to modify this comment.', 'FORBIDDEN');
    }
}

export class TaskCommentHasRepliesError extends TaskDomainError {
    constructor() {
        super('Comment with replies cannot be deleted.', 'CONFLICT');
    }
}

export class TaskAssigneeUserNotFoundError extends TaskDomainError {
    constructor() {
        super('User was not found.', 'NOT_FOUND');
    }
}
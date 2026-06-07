export abstract class TaskDomainError extends Error {
    protected constructor(message: string) {
        super(message);

        this.name = new.target.name;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidTaskIdError extends TaskDomainError {
    constructor() {
        super('Invalid task id.');
    }
}

export class InvalidTaskAssigneeIdError extends TaskDomainError {
    constructor() {
        super('Invalid task assignee id.');
    }
}

export class InvalidTaskCommentIdError extends TaskDomainError {
    constructor() {
        super('Invalid task comment id.');
    }
}

export class InvalidTaskWorkspaceIdError extends TaskDomainError {
    constructor() {
        super('Invalid workspace id.');
    }
}

export class InvalidTaskProjectIdError extends TaskDomainError {
    constructor() {
        super('Invalid project id.');
    }
}

export class InvalidTaskUserIdError extends TaskDomainError {
    constructor() {
        super('Invalid user id.');
    }
}

export class InvalidTaskTitleError extends TaskDomainError {
    constructor(reason: string) {
        super(`Invalid task title: ${reason}`);
    }
}

export class InvalidTaskDescriptionError extends TaskDomainError {
    constructor(reason: string) {
        super(`Invalid task description: ${reason}`);
    }
}

export class InvalidTaskCommentBodyError extends TaskDomainError {
    constructor(reason: string) {
        super(`Invalid task comment body: ${reason}`);
    }
}

export class InvalidTaskStatusError extends TaskDomainError {
    constructor() {
        super('Invalid task status.');
    }
}

export class InvalidTaskPriorityError extends TaskDomainError {
    constructor() {
        super('Invalid task priority.');
    }
}

export class InvalidTaskDateRangeError extends TaskDomainError {
    constructor() {
        super('Task start date cannot be after due date.');
    }
}

export class TaskWorkspaceNotFoundError extends TaskDomainError {
    constructor() {
        super('Workspace not found.');
    }
}

export class TaskProjectNotFoundError extends TaskDomainError {
    constructor() {
        super('Project not found.');
    }
}

export class TaskNotFoundError extends TaskDomainError {
    constructor() {
        super('Task not found.');
    }
}

export class TaskAccessDeniedError extends TaskDomainError {
    constructor() {
        super('You do not have access to this task.');
    }
}

export class TaskProjectAccessDeniedError extends TaskDomainError {
    constructor() {
        super('You do not have access to this project.');
    }
}

export class TaskProjectMismatchError extends TaskDomainError {
    constructor() {
        super('Task does not belong to this project.');
    }
}

export class TaskAssigneeAlreadyExistsError extends TaskDomainError {
    constructor() {
        super('User is already assigned to this task.');
    }
}

export class TaskAssigneeNotFoundError extends TaskDomainError {
    constructor() {
        super('Task assignee was not found.');
    }
}

export class TaskAssigneeTaskMismatchError extends TaskDomainError {
    constructor() {
        super('Task assignee does not belong to this task.');
    }
}

export class TaskAssigneeUserNotProjectMemberError extends TaskDomainError {
    constructor() {
        super('User must be a project member before being assigned to the task.');
    }
}

export class TaskCommentNotFoundError extends TaskDomainError {
    constructor() {
        super('Task comment was not found.');
    }
}

export class TaskCommentTaskMismatchError extends TaskDomainError {
    constructor() {
        super('Task comment does not belong to this task.');
    }
}

export class TaskCommentAccessDeniedError extends TaskDomainError {
    constructor() {
        super('You do not have access to modify this comment.');
    }
}

export class TaskCommentHasRepliesError extends TaskDomainError {
    constructor() {
        super('Comment with replies cannot be deleted.');
    }
}

export class TaskAssigneeUserNotFoundError extends TaskDomainError {
    constructor() {
        super('User was not found.');
    }
}

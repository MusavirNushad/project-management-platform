import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/errors/domain-error';

export abstract class WorklogDomainError extends DomainError {
  protected constructor(
    message: string,
    type: DomainErrorType,
    safeMessage = message,
  ) {
    super(message, type, safeMessage);
  }
}

export class InvalidWorklogIdError extends WorklogDomainError {
  constructor() {
    super('Invalid worklog id.', 'BAD_REQUEST');
  }
}

export class InvalidWorklogWorkspaceIdError extends WorklogDomainError {
  constructor() {
    super('Invalid workspace id.', 'BAD_REQUEST');
  }
}

export class InvalidWorklogProjectIdError extends WorklogDomainError {
  constructor() {
    super('Invalid project id.', 'BAD_REQUEST');
  }
}

export class InvalidWorklogTaskIdError extends WorklogDomainError {
  constructor() {
    super('Invalid task id.', 'BAD_REQUEST');
  }
}

export class InvalidWorklogUserIdError extends WorklogDomainError {
  constructor() {
    super('Invalid user id.', 'BAD_REQUEST');
  }
}

export class InvalidWorklogDescriptionError extends WorklogDomainError {
  constructor() {
    super('Invalid worklog description.', 'BAD_REQUEST');
  }
}

export class InvalidWorklogDateRangeError extends WorklogDomainError {
  constructor() {
    super('Worklog end time must be after start time.', 'BAD_REQUEST');
  }
}

export class WorklogWorkspaceNotFoundError extends WorklogDomainError {
  constructor() {
    super('Workspace not found.', 'NOT_FOUND');
  }
}

export class WorklogProjectNotFoundError extends WorklogDomainError {
  constructor() {
    super('Project not found.', 'NOT_FOUND');
  }
}

export class WorklogTaskNotFoundError extends WorklogDomainError {
  constructor() {
    super('Task not found.', 'NOT_FOUND');
  }
}

export class WorklogNotFoundError extends WorklogDomainError {
  constructor() {
    super('Worklog not found.', 'NOT_FOUND');
  }
}

export class WorklogAccessDeniedError extends WorklogDomainError {
  constructor() {
    super('You do not have access to this worklog.', 'FORBIDDEN');
  }
}

export class WorklogProjectAccessDeniedError extends WorklogDomainError {
  constructor() {
    super('You do not have access to this project.', 'FORBIDDEN');
  }
}

export class WorklogTaskMismatchError extends WorklogDomainError {
  constructor() {
    super('Worklog does not belong to this task.', 'BAD_REQUEST');
  }
}

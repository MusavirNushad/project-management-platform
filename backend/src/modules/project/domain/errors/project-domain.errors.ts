import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/errors/domain-error';

export abstract class ProjectDomainError extends DomainError {
  protected constructor(
    message: string,
    type: DomainErrorType,
    safeMessage = message,
  ) {
    super(message, type, safeMessage);
  }
}

export class InvalidProjectIdError extends ProjectDomainError {
  constructor() {
    super('Invalid project id.', 'BAD_REQUEST');
  }
}

export class InvalidProjectMemberIdError extends ProjectDomainError {
  constructor() {
    super('Invalid project member id.', 'BAD_REQUEST');
  }
}

export class InvalidProjectWorkspaceIdError extends ProjectDomainError {
  constructor() {
    super('Invalid project workspace id.', 'BAD_REQUEST');
  }
}

export class InvalidProjectUserIdError extends ProjectDomainError {
  constructor() {
    super('Invalid project user id.', 'BAD_REQUEST');
  }
}

export class InvalidProjectRoleIdError extends ProjectDomainError {
  constructor() {
    super('Invalid project role id.', 'BAD_REQUEST');
  }
}

export class InvalidProjectTitleError extends ProjectDomainError {
  constructor(reason: string) {
    super(`Invalid project title: ${reason}`, 'BAD_REQUEST');
  }
}

export class InvalidProjectDescriptionError extends ProjectDomainError {
  constructor(reason: string) {
    super(`Invalid project description: ${reason}`, 'BAD_REQUEST');
  }
}

export class InvalidProjectDateRangeError extends ProjectDomainError {
  constructor() {
    super('Project start date cannot be after due date.', 'BAD_REQUEST');
  }
}

export class InvalidProjectStatusError extends ProjectDomainError {
  constructor() {
    super('Invalid project status.', 'BAD_REQUEST');
  }
}

export class ProjectNotFoundError extends ProjectDomainError {
  constructor() {
    super('Project not found.', 'NOT_FOUND');
  }
}

export class ProjectWorkspaceNotFoundError extends ProjectDomainError {
  constructor() {
    super('Workspace not found.', 'NOT_FOUND');
  }
}

export class ProjectAccessDeniedError extends ProjectDomainError {
  constructor() {
    super('You do not have access to this project.', 'FORBIDDEN');
  }
}

export class ProjectWorkspaceAccessDeniedError extends ProjectDomainError {
  constructor() {
    super('You do not have access to this workspace.', 'FORBIDDEN');
  }
}

export class ProjectWorkspaceMismatchError extends ProjectDomainError {
  constructor() {
    super('Project does not belong to this workspace.', 'BAD_REQUEST');
  }
}

export class ProjectMemberAlreadyExistsError extends ProjectDomainError {
  constructor() {
    super('User is already a member of this project.', 'CONFLICT');
  }
}

export class ProjectMemberNotFoundError extends ProjectDomainError {
  constructor() {
    super('Project member was not found.', 'NOT_FOUND');
  }
}

export class ProjectMemberUserNotFoundError extends ProjectDomainError {
  constructor() {
    super('User was not found.', 'NOT_FOUND');
  }
}

export class ProjectMemberProjectMismatchError extends ProjectDomainError {
  constructor() {
    super('Project member does not belong to this project.', 'BAD_REQUEST');
  }
}

export class ProjectCreatorCannotBeRemovedError extends ProjectDomainError {
  constructor() {
    super('Project creator cannot be removed.', 'BAD_REQUEST');
  }
}

export class ProjectCreatorRoleNotFoundError extends ProjectDomainError {
  constructor() {
    super(
      'Project creator role was not found.',
      'INTERNAL',
      'Project could not be created right now.',
    );
  }
}

export class ProjectRoleNotFoundError extends ProjectDomainError {
  constructor() {
    super('Project role was not found.', 'NOT_FOUND');
  }
}

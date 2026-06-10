import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/errors/domain-error';

export abstract class WorkspaceDomainError extends DomainError {
  protected constructor(
    message: string,
    type: DomainErrorType,
    safeMessage = message,
  ) {
    super(message, type, safeMessage);
  }
}

export class InvalidWorkspaceIdError extends WorkspaceDomainError {
  constructor() {
    super('Invalid workspace id.', 'BAD_REQUEST');
  }
}

export class InvalidWorkspaceMemberIdError extends WorkspaceDomainError {
  constructor() {
    super('Invalid workspace member id.', 'BAD_REQUEST');
  }
}

export class InvalidWorkspaceUserIdError extends WorkspaceDomainError {
  constructor() {
    super('Invalid workspace user id.', 'BAD_REQUEST');
  }
}

export class InvalidWorkspaceRoleIdError extends WorkspaceDomainError {
  constructor() {
    super('Invalid workspace role id.', 'BAD_REQUEST');
  }
}

export class InvalidWorkspaceNameError extends WorkspaceDomainError {
  constructor(reason: string) {
    super(`Invalid workspace name: ${reason}`, 'BAD_REQUEST');
  }
}

export class InvalidWorkspaceSlugError extends WorkspaceDomainError {
  constructor(reason: string) {
    super(`Invalid workspace slug: ${reason}`, 'BAD_REQUEST');
  }
}

export class InvalidWorkspaceDescriptionError extends WorkspaceDomainError {
  constructor(reason: string) {
    super(`Invalid workspace description: ${reason}`, 'BAD_REQUEST');
  }
}

export class WorkspaceAlreadyExistsError extends WorkspaceDomainError {
  constructor() {
    super('Workspace already exists.', 'CONFLICT');
  }
}

export class WorkspaceNotFoundError extends WorkspaceDomainError {
  constructor() {
    super('Workspace not found.', 'NOT_FOUND');
  }
}

export class WorkspaceAccessDeniedError extends WorkspaceDomainError {
  constructor() {
    super('You do not have access to this workspace.', 'FORBIDDEN');
  }
}

export class WorkspaceOwnerRoleNotFoundError extends WorkspaceDomainError {
  constructor() {
    super(
      'Workspace owner role was not found.',
      'INTERNAL',
      'Workspace could not be created right now.',
    );
  }
}

export class WorkspaceMemberAlreadyExistsError extends WorkspaceDomainError {
  constructor() {
    super('User is already a member of this workspace.', 'CONFLICT');
  }
}

export class WorkspaceMemberUserNotFoundError extends WorkspaceDomainError {
  constructor() {
    super('Workspace member user was not found.', 'NOT_FOUND');
  }
}

export class WorkspaceRoleNotFoundError extends WorkspaceDomainError {
  constructor() {
    super('Workspace role was not found.', 'NOT_FOUND');
  }
}

export class WorkspaceMemberNotFoundError extends WorkspaceDomainError {
  constructor() {
    super('Workspace member was not found.', 'NOT_FOUND');
  }
}

export class WorkspaceMemberWorkspaceMismatchError extends WorkspaceDomainError {
  constructor() {
    super('Workspace member does not belong to this workspace.', 'BAD_REQUEST');
  }
}

export class WorkspaceOwnerCannotBeRemovedError extends WorkspaceDomainError {
  constructor() {
    super('Workspace owner cannot be removed.', 'BAD_REQUEST');
  }
}

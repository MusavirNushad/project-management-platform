
import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/errors/domain-error';

export abstract class IdentityDomainError extends DomainError {
  protected constructor(
    message: string,
    type: DomainErrorType,
    safeMessage = message,
  ) {
    super(message, type, safeMessage);
  }
}

export class InvalidUserIdError extends IdentityDomainError {
  constructor(value: string) {
    super(`Invalid user id: ${value}`, 'BAD_REQUEST');
  }
}

export class InvalidUserProfileIdError extends IdentityDomainError {
  constructor(value: string) {
    super(`Invalid user profile id: ${value}`, 'BAD_REQUEST');
  }
}

export class InvalidEmailError extends IdentityDomainError {
  constructor(value: string) {
    super(`Invalid email address: ${value}`, 'BAD_REQUEST');
  }
}

export class InvalidUserNameError extends IdentityDomainError {
  constructor(reason: string) {
    super(`Invalid user name: ${reason}`, 'BAD_REQUEST');
  }
}

export class InvalidPasswordError extends IdentityDomainError {
  constructor(reason: string) {
    super(`Invalid password: ${reason}`, 'BAD_REQUEST');
  }
}

export class InvalidPasswordHashError extends IdentityDomainError {
  constructor() {
    super(
      'Invalid password hash.',
      'INTERNAL',
      'Authentication could not be processed right now.',
    );
  }
}

export class UserProfileUserMismatchError extends IdentityDomainError {
  constructor() {
    super('User profile does not belong to this user.', 'BAD_REQUEST');
  }
}

export class UserAlreadyExistsError extends IdentityDomainError {
  constructor() {
    super('User already exists.', 'CONFLICT');
  }
}

export class InvalidCredentialsError extends IdentityDomainError {
  constructor() {
    super('Invalid email or password.', 'UNAUTHORIZED');
  }
}

export class UserNotFoundError extends IdentityDomainError {
  constructor() {
    super('User not found.', 'NOT_FOUND');
  }
}

export class InvalidRefreshTokenError extends IdentityDomainError {
  constructor() {
    super('Invalid refresh token.', 'UNAUTHORIZED');
  }
}
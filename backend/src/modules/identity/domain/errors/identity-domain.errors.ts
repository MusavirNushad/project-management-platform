export abstract class IdentityDomainError extends Error {
  protected constructor(message: string) {
    super(message);

    this.name = new.target.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidUserIdError extends IdentityDomainError {
  constructor(value: string) {
    super(`Invalid user id: ${value}`);
  }
}

export class InvalidUserProfileIdError extends IdentityDomainError {
  constructor(value: string) {
    super(`Invalid user profile id: ${value}`);
  }
}

export class InvalidEmailError extends IdentityDomainError {
  constructor(value: string) {
    super(`Invalid email address: ${value}`);
  }
}

export class InvalidUserNameError extends IdentityDomainError {
  constructor(reason: string) {
    super(`Invalid user name: ${reason}`);
  }
}

export class InvalidPasswordError extends IdentityDomainError {
  constructor(reason: string) {
    super(`Invalid password: ${reason}`);
  }
}

export class InvalidPasswordHashError extends IdentityDomainError {
  constructor() {
    super('Invalid password hash.');
  }
}

export class UserProfileUserMismatchError extends IdentityDomainError {
  constructor() {
    super('User profile does not belong to this user.');
  }
}

export class UserAlreadyExistsError extends IdentityDomainError {
  constructor() {
    super('User already exists.');
  }
}

export class InvalidCredentialsError extends IdentityDomainError {
  constructor() {
    super('Invalid email or password.');
  }
}

export class UserNotFoundError extends IdentityDomainError {
  constructor() {
    super('User not found.');
  }
}

export class InvalidRefreshTokenError extends IdentityDomainError {
  constructor() {
    super('Invalid refresh token.');
  }
}


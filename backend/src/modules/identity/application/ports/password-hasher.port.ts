import { Password, PasswordHash } from '../../domain/value-objects/password.vo';

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface PasswordHasherPort {
  hash(password: Password): Promise<PasswordHash>;

  compare(password: Password, passwordHash: PasswordHash): Promise<boolean>;
}

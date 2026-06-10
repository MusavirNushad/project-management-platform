import { UserEntity } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  save(user: UserEntity): Promise<UserEntity>;

  findById(id: UserId): Promise<UserEntity | null>;

  findByEmail(email: Email): Promise<UserEntity | null>;

  existsByEmail(email: Email): Promise<boolean>;
}

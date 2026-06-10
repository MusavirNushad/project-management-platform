import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PasswordHasherPort } from '../../application/ports/password-hasher.port';
import { Password, PasswordHash } from '../../domain/value-objects/password.vo';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  private static readonly DEFAULT_SALT_ROUNDS = 10;

  constructor(private readonly configService: ConfigService) {}

  async hash(password: Password): Promise<PasswordHash> {
    const passwordHash = await bcrypt.hash(
      password.value,
      this.getSaltRounds(),
    );

    return PasswordHash.create(passwordHash);
  }

  async compare(
    password: Password,
    passwordHash: PasswordHash,
  ): Promise<boolean> {
    return bcrypt.compare(password.value, passwordHash.value);
  }

  private getSaltRounds(): number {
    const value = this.configService.get<string>('BCRYPT_SALT_ROUNDS');

    if (!value) {
      return BcryptPasswordHasher.DEFAULT_SALT_ROUNDS;
    }

    const saltRounds = Number(value);

    if (!Number.isInteger(saltRounds) || saltRounds < 8 || saltRounds > 15) {
      return BcryptPasswordHasher.DEFAULT_SALT_ROUNDS;
    }

    return saltRounds;
  }
}

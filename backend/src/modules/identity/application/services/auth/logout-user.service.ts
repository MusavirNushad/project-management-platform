import { Injectable } from '@nestjs/common';

export type LogoutUserInput = {
  userId: string;
};

export type LogoutUserResult = {
  message: string;
};

@Injectable()
export class LogoutUserService {
  async execute(input: LogoutUserInput): Promise<LogoutUserResult> {
    void input;

    return {
      message: 'Logged out successfully.',
    };
  }
}

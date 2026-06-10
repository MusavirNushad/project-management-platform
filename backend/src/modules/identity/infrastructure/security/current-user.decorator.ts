import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import type { AuthTokenPayload } from '../../application/ports/token-service.port';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthTokenPayload | undefined,
    context: ExecutionContext,
  ): AuthTokenPayload | string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Unauthorized.');
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);

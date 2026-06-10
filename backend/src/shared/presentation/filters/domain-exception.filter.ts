import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { DomainError, DomainErrorType } from '../../domain/errors/domain-error';

type DomainErrorResponseBody = {
  statusCode: number;
  error: string;
  message: string;
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode = this.getStatusCode(exception.type);

    const body: DomainErrorResponseBody = {
      statusCode,
      error: this.getHttpErrorName(statusCode),
      message: exception.safeMessage,
    };

    response.status(statusCode).json(body);
  }

  private getStatusCode(type: DomainErrorType): number {
    const statusMap: Record<DomainErrorType, number> = {
      BAD_REQUEST: HttpStatus.BAD_REQUEST,
      UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
      FORBIDDEN: HttpStatus.FORBIDDEN,
      NOT_FOUND: HttpStatus.NOT_FOUND,
      CONFLICT: HttpStatus.CONFLICT,
      INTERNAL: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[type];
  }

  private getHttpErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };

    return errorNames[statusCode] ?? 'Domain Error';
  }
}

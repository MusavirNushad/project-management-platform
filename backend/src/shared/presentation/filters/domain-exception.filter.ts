import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { IdentityDomainError } from '../../../modules/identity/domain/errors/identity-domain.errors';

type ErrorResponseBody = {
    statusCode: number;
    error: string;
    message: string;
};

@Catch(IdentityDomainError)
export class DomainExceptionFilter implements ExceptionFilter<IdentityDomainError> {
    catch(exception: IdentityDomainError, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();

        const statusCode = this.getStatusCode(exception);
        const error = this.getHttpErrorName(statusCode);
        const message = this.getSafeMessage(exception);

        const body: ErrorResponseBody = {
            statusCode,
            error,
            message,
        };

        response.status(statusCode).json(body);
    }

    private getStatusCode(exception: IdentityDomainError): number {
        switch (exception.name) {
            case 'UserAlreadyExistsError':
                return HttpStatus.CONFLICT;

            case 'InvalidCredentialsError':
            case 'InvalidRefreshTokenError':
                return HttpStatus.UNAUTHORIZED;

            case 'UserNotFoundError':
                return HttpStatus.NOT_FOUND;

            case 'InvalidUserIdError':
            case 'InvalidUserProfileIdError':
            case 'InvalidEmailError':
            case 'InvalidUserNameError':
            case 'InvalidPasswordError':
            case 'InvalidPasswordHashError':
            case 'UserProfileUserMismatchError':
                return HttpStatus.BAD_REQUEST;

            default:
                return HttpStatus.BAD_REQUEST;
        }
    }

    private getSafeMessage(exception: IdentityDomainError): string {
        switch (exception.name) {
            case 'UserAlreadyExistsError':
                return 'Unable to complete registration.';

            case 'InvalidCredentialsError':
                return 'Invalid email or password.';

            case 'InvalidRefreshTokenError':
                return 'Invalid refresh token.';

            case 'UserNotFoundError':
                return 'User not found.';

            case 'InvalidUserIdError':
                return 'Invalid user id.';

            case 'InvalidUserProfileIdError':
                return 'Invalid user profile id.';

            case 'InvalidEmailError':
                return 'Invalid email address.';

            case 'InvalidUserNameError':
                return 'Invalid user name.';

            case 'InvalidPasswordError':
                return 'Invalid password.';

            case 'InvalidPasswordHashError':
                return 'Invalid password hash.';

            case 'UserProfileUserMismatchError':
                return 'User profile does not belong to this user.';

            default:
                return 'Invalid request.';
        }
    }

    private getHttpErrorName(statusCode: number): string {
        switch (statusCode) {
            case HttpStatus.BAD_REQUEST:
                return 'Bad Request';

            case HttpStatus.UNAUTHORIZED:
                return 'Unauthorized';

            case HttpStatus.NOT_FOUND:
                return 'Not Found';

            case HttpStatus.CONFLICT:
                return 'Conflict';

            default:
                return 'Domain Error';
        }
    }
}
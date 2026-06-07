import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { IdentityDomainError } from '../../../modules/identity/domain/errors/identity-domain.errors';
import { WorkspaceDomainError } from '../../../modules/workspace/domain/errors/workspace-domain.errors';
import { ProjectDomainError } from '../../../modules/project/domain/errors/project-domain.errors';

type DomainException = IdentityDomainError | WorkspaceDomainError | ProjectDomainError;

type ErrorResponseBody = {
    statusCode: number;
    error: string;
    message: string;
};

@Catch(IdentityDomainError, WorkspaceDomainError, ProjectDomainError)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
    catch(exception: DomainException, host: ArgumentsHost): void {
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

    private getStatusCode(exception: DomainException): number {
        switch (exception.name) {
            /**
             * Identity errors
             */
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

            /**
             * Workspace errors
             */
            case 'WorkspaceAlreadyExistsError':
            case 'WorkspaceMemberAlreadyExistsError':
                return HttpStatus.CONFLICT;

            case 'WorkspaceNotFoundError':
            case 'WorkspaceMemberUserNotFoundError':
            case 'WorkspaceMemberNotFoundError':
            case 'WorkspaceRoleNotFoundError':
                return HttpStatus.NOT_FOUND;

            case 'WorkspaceAccessDeniedError':
                return HttpStatus.FORBIDDEN;

            case 'WorkspaceOwnerRoleNotFoundError':
                return HttpStatus.INTERNAL_SERVER_ERROR;

            case 'InvalidWorkspaceIdError':
            case 'InvalidWorkspaceMemberIdError':
            case 'InvalidWorkspaceUserIdError':
            case 'InvalidWorkspaceRoleIdError':
            case 'InvalidWorkspaceNameError':
            case 'InvalidWorkspaceSlugError':
            case 'InvalidWorkspaceDescriptionError':
            case 'WorkspaceMemberWorkspaceMismatchError':
            case 'WorkspaceOwnerCannotBeRemovedError':
                return HttpStatus.BAD_REQUEST;

            /**
            * Project errors
            */
            case 'ProjectWorkspaceNotFoundError':
            case 'ProjectNotFoundError':
            case 'ProjectMemberUserNotFoundError':
            case 'ProjectMemberNotFoundError':
                return HttpStatus.NOT_FOUND;

            case 'ProjectWorkspaceAccessDeniedError':
            case 'ProjectAccessDeniedError':
                return HttpStatus.FORBIDDEN;

            case 'ProjectMemberAlreadyExistsError':
                return HttpStatus.CONFLICT;

            case 'ProjectCreatorRoleNotFoundError':
            case 'ProjectRoleNotFoundError':
                return HttpStatus.INTERNAL_SERVER_ERROR;

            case 'InvalidProjectIdError':
            case 'InvalidProjectMemberIdError':
            case 'InvalidProjectWorkspaceIdError':
            case 'InvalidProjectUserIdError':
            case 'InvalidProjectRoleIdError':
            case 'InvalidProjectTitleError':
            case 'InvalidProjectDescriptionError':
            case 'InvalidProjectDateRangeError':
            case 'InvalidProjectStatusError':
            case 'ProjectWorkspaceMismatchError':
            case 'ProjectMemberProjectMismatchError':
            case 'ProjectCreatorCannotBeRemovedError':
                return HttpStatus.BAD_REQUEST;

            default:
                return HttpStatus.BAD_REQUEST;
        }
    }

    private getSafeMessage(exception: DomainException): string {
        switch (exception.name) {
            /**
             * Identity errors
             */
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
            case 'WorkspaceOwnerCannotBeRemovedError':
                return 'The owner of the workspace cannot be removed.';

            /**
             * Workspace errors
             */
            case 'WorkspaceAlreadyExistsError':
                return 'Unable to create workspace.';

            case 'WorkspaceMemberAlreadyExistsError':
                return 'User is already a member of this workspace.';

            case 'WorkspaceNotFoundError':
                return 'Workspace not found.';

            case 'WorkspaceAccessDeniedError':
                return 'You do not have access to this workspace.';

            case 'WorkspaceOwnerRoleNotFoundError':
                return 'Workspace setup is not configured.';

            case 'InvalidWorkspaceIdError':
                return 'Invalid workspace id.';

            case 'InvalidWorkspaceMemberIdError':
                return 'Invalid workspace member id.';

            case 'InvalidWorkspaceUserIdError':
                return 'Invalid workspace user id.';

            case 'InvalidWorkspaceRoleIdError':
                return 'Invalid workspace role id.';

            case 'InvalidWorkspaceNameError':
                return 'Invalid workspace name.';

            case 'InvalidWorkspaceSlugError':
                return 'Invalid workspace slug.';

            case 'InvalidWorkspaceDescriptionError':
                return 'Invalid workspace description.';

            /**
             * Workspace member errors
             */
            case 'WorkspaceMemberUserNotFoundError':
                return 'User was not found.';

            case 'WorkspaceRoleNotFoundError':
                return 'Workspace role was not found.';

            case 'WorkspaceMemberNotFoundError':
                return 'Workspace member was not found.';

            case 'WorkspaceMemberWorkspaceMismatchError':
                return 'Workspace member does not belong to this workspace.';

            /**
         * Project  errors
         */
            case 'ProjectWorkspaceNotFoundError':
                return 'Workspace not found.';

            case 'ProjectNotFoundError':
                return 'Project not found.';

            case 'ProjectWorkspaceAccessDeniedError':
                return 'You do not have access to this workspace.';

            case 'ProjectAccessDeniedError':
                return 'You do not have access to this project.';

            case 'ProjectCreatorRoleNotFoundError':
                return 'Project setup is not configured.';

            case 'ProjectRoleNotFoundError':
                return 'Project role was not found.';

            case 'ProjectMemberAlreadyExistsError':
                return 'User is already a member of this project.';

            case 'ProjectMemberUserNotFoundError':
                return 'User was not found.';

            case 'ProjectMemberNotFoundError':
                return 'Project member was not found.';

            case 'ProjectWorkspaceMismatchError':
                return 'Project does not belong to this workspace.';

            case 'ProjectMemberProjectMismatchError':
                return 'Project member does not belong to this project.';

            case 'ProjectCreatorCannotBeRemovedError':
                return 'Project creator cannot be removed.';

            case 'InvalidProjectIdError':
                return 'Invalid project id.';

            case 'InvalidProjectMemberIdError':
                return 'Invalid project member id.';

            case 'InvalidProjectWorkspaceIdError':
                return 'Invalid project workspace id.';

            case 'InvalidProjectUserIdError':
                return 'Invalid project user id.';

            case 'InvalidProjectRoleIdError':
                return 'Invalid project role id.';

            case 'InvalidProjectTitleError':
                return 'Invalid project title.';

            case 'InvalidProjectDescriptionError':
                return 'Invalid project description.';

            case 'InvalidProjectDateRangeError':
                return 'Project start date cannot be after due date.';

            case 'InvalidProjectStatusError':
                return 'Invalid project status.';


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

            case HttpStatus.FORBIDDEN:
                return 'Forbidden';

            case HttpStatus.NOT_FOUND:
                return 'Not Found';

            case HttpStatus.CONFLICT:
                return 'Conflict';

            case HttpStatus.INTERNAL_SERVER_ERROR:
                return 'Internal Server Error';

            default:
                return 'Domain Error';
        }
    }
}

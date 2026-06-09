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
import { TaskDomainError } from '../../../modules/task/domain/errors/task-domain.errors';
import { SprintDomainError } from '../../../modules/sprint/domain/errors/sprint-domain.errors';

type DomainException =
    | IdentityDomainError
    | WorkspaceDomainError
    | ProjectDomainError
    | TaskDomainError
    | SprintDomainError;

type ErrorResponseBody = {
    statusCode: number;
    error: string;
    message: string;
};

@Catch(
    IdentityDomainError,
    WorkspaceDomainError,
    ProjectDomainError,
    TaskDomainError,
    SprintDomainError,
)
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

            /**
             * Task errors
             */
            case 'TaskWorkspaceNotFoundError':
            case 'TaskProjectNotFoundError':
            case 'TaskNotFoundError':
            case 'TaskAssigneeNotFoundError':
            case 'TaskAssigneeUserNotFoundError':
            case 'TaskCommentNotFoundError':
                return HttpStatus.NOT_FOUND;

            case 'TaskAccessDeniedError':
            case 'TaskProjectAccessDeniedError':
            case 'TaskCommentAccessDeniedError':
                return HttpStatus.FORBIDDEN;

            case 'TaskAssigneeAlreadyExistsError':
                return HttpStatus.CONFLICT;

            case 'InvalidTaskIdError':
            case 'InvalidTaskAssigneeIdError':
            case 'InvalidTaskCommentIdError':
            case 'InvalidTaskWorkspaceIdError':
            case 'InvalidTaskProjectIdError':
            case 'InvalidTaskUserIdError':
            case 'InvalidTaskTitleError':
            case 'InvalidTaskDescriptionError':
            case 'InvalidTaskCommentBodyError':
            case 'InvalidTaskStatusError':
            case 'InvalidTaskPriorityError':
            case 'InvalidTaskDateRangeError':
            case 'TaskProjectMismatchError':
            case 'TaskAssigneeTaskMismatchError':
            case 'TaskAssigneeUserNotProjectMemberError':
            case 'TaskCommentTaskMismatchError':
            case 'TaskCommentHasRepliesError':
                return HttpStatus.BAD_REQUEST;

            /**
             * Sprint errors
             */
            case 'SprintWorkspaceNotFoundError':
            case 'SprintProjectNotFoundError':
            case 'SprintNotFoundError':
            case 'SprintTaskReferenceNotFoundError':
            case 'SprintTaskNotFoundError':
                return HttpStatus.NOT_FOUND;

            case 'SprintAccessDeniedError':
            case 'SprintProjectAccessDeniedError':
                return HttpStatus.FORBIDDEN;

            case 'InvalidSprintIdError':
            case 'InvalidSprintTaskIdError':
            case 'InvalidSprintWorkspaceIdError':
            case 'InvalidSprintProjectIdError':
            case 'InvalidSprintUserIdError':
            case 'InvalidSprintNameError':
            case 'InvalidSprintGoalError':
            case 'InvalidSprintStatusError':
            case 'InvalidSprintDateRangeError':
            case 'SprintProjectMismatchError':
            case 'InvalidSprintPositionError':
            case 'SprintCannotAcceptTasksError':
            case 'SprintTaskSprintMismatchError':
            case 'SprintTaskAlreadyRemovedError':
            case 'SprintCannotRemoveTasksError':
                return HttpStatus.BAD_REQUEST;

            /**
             * Worklog errors
             */
            case 'WorklogWorkspaceNotFoundError':
            case 'WorklogProjectNotFoundError':
            case 'WorklogTaskNotFoundError':
            case 'WorklogNotFoundError':
                return HttpStatus.NOT_FOUND;

            case 'WorklogAccessDeniedError':
            case 'WorklogProjectAccessDeniedError':
                return HttpStatus.FORBIDDEN;

            case 'InvalidWorklogIdError':
            case 'InvalidWorklogWorkspaceIdError':
            case 'InvalidWorklogProjectIdError':
            case 'InvalidWorklogTaskIdError':
            case 'InvalidWorklogUserIdError':
            case 'InvalidWorklogDescriptionError':
            case 'InvalidWorklogDateRangeError':
            case 'WorklogTaskMismatchError':
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

            case 'WorkspaceMemberUserNotFoundError':
                return 'User was not found.';

            case 'WorkspaceRoleNotFoundError':
                return 'Workspace role was not found.';

            case 'WorkspaceMemberNotFoundError':
                return 'Workspace member was not found.';

            case 'WorkspaceMemberWorkspaceMismatchError':
                return 'Workspace member does not belong to this workspace.';

            case 'WorkspaceOwnerCannotBeRemovedError':
                return 'The owner of the workspace cannot be removed.';

            /**
             * Project errors
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

            /**
             * Task errors
             */
            case 'TaskWorkspaceNotFoundError':
                return 'Workspace not found.';

            case 'TaskProjectNotFoundError':
                return 'Project not found.';

            case 'TaskNotFoundError':
                return 'Task not found.';

            case 'TaskAssigneeUserNotFoundError':
                return 'User was not found.';

            case 'TaskAccessDeniedError':
                return 'You do not have access to this task.';

            case 'TaskProjectAccessDeniedError':
                return 'You do not have access to this project.';

            case 'TaskProjectMismatchError':
                return 'Task does not belong to this project.';

            case 'TaskAssigneeAlreadyExistsError':
                return 'User is already assigned to this task.';

            case 'TaskAssigneeNotFoundError':
                return 'Task assignee was not found.';

            case 'TaskAssigneeTaskMismatchError':
                return 'Task assignee does not belong to this task.';

            case 'TaskAssigneeUserNotProjectMemberError':
                return 'User must be a project member before being assigned to the task.';

            case 'TaskCommentNotFoundError':
                return 'Task comment was not found.';

            case 'TaskCommentTaskMismatchError':
                return 'Task comment does not belong to this task.';

            case 'TaskCommentAccessDeniedError':
                return 'You do not have access to modify this comment.';

            case 'TaskCommentHasRepliesError':
                return 'Comment with replies cannot be deleted.';

            case 'InvalidTaskIdError':
                return 'Invalid task id.';

            case 'InvalidTaskAssigneeIdError':
                return 'Invalid task assignee id.';

            case 'InvalidTaskCommentIdError':
                return 'Invalid task comment id.';

            case 'InvalidTaskWorkspaceIdError':
                return 'Invalid workspace id.';

            case 'InvalidTaskProjectIdError':
                return 'Invalid project id.';

            case 'InvalidTaskUserIdError':
                return 'Invalid user id.';

            case 'InvalidTaskTitleError':
                return 'Invalid task title.';

            case 'InvalidTaskDescriptionError':
                return 'Invalid task description.';

            case 'InvalidTaskCommentBodyError':
                return 'Invalid task comment body.';

            case 'InvalidTaskStatusError':
                return 'Invalid task status.';

            case 'InvalidTaskPriorityError':
                return 'Invalid task priority.';

            case 'InvalidTaskDateRangeError':
                return 'Task start date cannot be after due date.';

            /**
             * Sprint errors
             */
            case 'SprintWorkspaceNotFoundError':
                return 'Workspace not found.';

            case 'SprintProjectNotFoundError':
                return 'Project not found.';

            case 'SprintNotFoundError':
                return 'Sprint not found.';

            case 'SprintAccessDeniedError':
                return 'You do not have access to this sprint.';

            case 'SprintProjectAccessDeniedError':
                return 'You do not have access to this project.';

            case 'InvalidSprintIdError':
                return 'Invalid sprint id.';

            case 'InvalidSprintTaskIdError':
                return 'Invalid sprint task id.';

            case 'InvalidSprintWorkspaceIdError':
                return 'Invalid workspace id.';

            case 'InvalidSprintProjectIdError':
                return 'Invalid project id.';

            case 'InvalidSprintUserIdError':
                return 'Invalid user id.';

            case 'InvalidSprintNameError':
                return 'Invalid sprint name.';

            case 'InvalidSprintGoalError':
                return 'Invalid sprint goal.';

            case 'InvalidSprintStatusError':
                return 'Invalid sprint status.';

            case 'InvalidSprintDateRangeError':
                return 'Sprint start date cannot be after end date.';

            case 'SprintProjectMismatchError':
                return 'Sprint does not belong to this project.';

            case 'SprintTaskReferenceNotFoundError':
                return 'Task was not found in this project.';

            case 'TaskAlreadyInActiveSprintError':
                return 'Task is already in an active sprint.';

            case 'SprintCannotAcceptTasksError':
                return 'Tasks can only be added to planned or active sprints.';

            case 'InvalidSprintTaskPositionError':
                return 'Invalid sprint task position.';

            case 'SprintTaskNotFoundError':
                return 'Sprint task not found.';

            case 'SprintTaskSprintMismatchError':
                return 'Sprint task does not belong to this sprint.';

            case 'SprintTaskAlreadyRemovedError':
                return 'Task is already removed from this sprint.';

            case 'SprintCannotRemoveTasksError':
                return 'Tasks can only be removed from planned or active sprints.';

            /**
             * Worklog errors
             */
            case 'WorklogWorkspaceNotFoundError':
                return 'Workspace not found.';

            case 'WorklogProjectNotFoundError':
                return 'Project not found.';

            case 'WorklogTaskNotFoundError':
                return 'Task not found.';

            case 'WorklogNotFoundError':
                return 'Worklog not found.';

            case 'WorklogAccessDeniedError':
                return 'You do not have access to this worklog.';

            case 'WorklogProjectAccessDeniedError':
                return 'You do not have access to this project.';

            case 'InvalidWorklogIdError':
                return 'Invalid worklog id.';

            case 'InvalidWorklogWorkspaceIdError':
                return 'Invalid workspace id.';

            case 'InvalidWorklogProjectIdError':
                return 'Invalid project id.';

            case 'InvalidWorklogTaskIdError':
                return 'Invalid task id.';

            case 'InvalidWorklogUserIdError':
                return 'Invalid user id.';

            case 'InvalidWorklogDescriptionError':
                return 'Invalid worklog description.';

            case 'InvalidWorklogDateRangeError':
                return 'Worklog end time must be after start time.';

            case 'WorklogTaskMismatchError':
                return 'Worklog does not belong to this task.';

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

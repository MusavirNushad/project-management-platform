// src/modules/report/domain/errors/report-domain.errors.ts

import {
    DomainError,
    DomainErrorType,
} from '../../../../shared/domain/errors/domain-error';

export abstract class ReportDomainError extends DomainError {
    protected constructor(
        message: string,
        type: DomainErrorType,
        safeMessage = message,
    ) {
        super(message, type, safeMessage);
    }
}

export class InvalidReportIdError extends ReportDomainError {
    constructor() {
        super('Invalid report id.', 'BAD_REQUEST');
    }
}

export class InvalidReportWorkspaceIdError extends ReportDomainError {
    constructor() {
        super('Invalid workspace id.', 'BAD_REQUEST');
    }
}

export class InvalidReportProjectIdError extends ReportDomainError {
    constructor() {
        super('Invalid project id.', 'BAD_REQUEST');
    }
}

export class InvalidReportUserIdError extends ReportDomainError {
    constructor() {
        super('Invalid user id.', 'BAD_REQUEST');
    }
}

export class InvalidReportNameError extends ReportDomainError {
    constructor() {
        super('Invalid report name.', 'BAD_REQUEST');
    }
}

export class InvalidReportFileError extends ReportDomainError {
    constructor() {
        super('Invalid report file.', 'BAD_REQUEST');
    }
}

export class InvalidReportStatusError extends ReportDomainError {
    constructor() {
        super('Invalid report status.', 'BAD_REQUEST');
    }
}

export class InvalidReportDateRangeError extends ReportDomainError {
    constructor() {
        super('Report start date cannot be after end date.', 'BAD_REQUEST');
    }
}

export class ReportWorkspaceNotFoundError extends ReportDomainError {
    constructor() {
        super('Workspace not found.', 'NOT_FOUND');
    }
}

export class ReportProjectNotFoundError extends ReportDomainError {
    constructor() {
        super('Project not found.', 'NOT_FOUND');
    }
}

export class ReportNotFoundError extends ReportDomainError {
    constructor() {
        super('Report not found.', 'NOT_FOUND');
    }
}

export class ReportAccessDeniedError extends ReportDomainError {
    constructor() {
        super('You do not have access to this report.', 'FORBIDDEN');
    }
}

export class ReportProjectAccessDeniedError extends ReportDomainError {
    constructor() {
        super('You do not have access to this project.', 'FORBIDDEN');
    }
}

export class ReportProjectMismatchError extends ReportDomainError {
    constructor() {
        super('Report does not belong to this project.', 'BAD_REQUEST');
    }
}
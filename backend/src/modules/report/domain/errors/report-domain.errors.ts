export abstract class ReportDomainError extends Error {
    protected constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidReportIdError extends ReportDomainError {
    constructor() {
        super('Invalid report id.');
    }
}

export class InvalidReportWorkspaceIdError extends ReportDomainError {
    constructor() {
        super('Invalid workspace id.');
    }
}

export class InvalidReportProjectIdError extends ReportDomainError {
    constructor() {
        super('Invalid project id.');
    }
}

export class InvalidReportUserIdError extends ReportDomainError {
    constructor() {
        super('Invalid user id.');
    }
}

export class InvalidReportNameError extends ReportDomainError {
    constructor() {
        super('Invalid report name.');
    }
}

export class InvalidReportFileError extends ReportDomainError {
    constructor() {
        super('Invalid report file.');
    }
}

export class InvalidReportStatusError extends ReportDomainError {
    constructor() {
        super('Invalid report status.');
    }
}

export class InvalidReportDateRangeError extends ReportDomainError {
    constructor() {
        super('Report start date cannot be after end date.');
    }
}

export class ReportWorkspaceNotFoundError extends ReportDomainError {
    constructor() {
        super('Workspace not found.');
    }
}

export class ReportProjectNotFoundError extends ReportDomainError {
    constructor() {
        super('Project not found.');
    }
}

export class ReportNotFoundError extends ReportDomainError {
    constructor() {
        super('Report not found.');
    }
}

export class ReportAccessDeniedError extends ReportDomainError {
    constructor() {
        super('You do not have access to this report.');
    }
}

export class ReportProjectAccessDeniedError extends ReportDomainError {
    constructor() {
        super('You do not have access to this project.');
    }
}

export class ReportProjectMismatchError extends ReportDomainError {
    constructor() {
        super('Report does not belong to this project.');
    }
}
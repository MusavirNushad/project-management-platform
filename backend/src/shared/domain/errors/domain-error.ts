export type DomainErrorType =
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'INTERNAL';

export abstract class DomainError extends Error {
    protected constructor(
        message: string,
        public readonly type: DomainErrorType,
        public readonly safeMessage = message,
    ) {
        super(message);

        this.name = new.target.name;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}
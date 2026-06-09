import { InvalidReportNameError } from '../errors/report-domain.errors';

export class ReportName {
    private constructor(private readonly props: { value: string }) { }

    static create(value: string): ReportName {
        const normalizedValue =
            typeof value === 'string'
                ? value.trim().replace(/\s+/g, ' ')
                : '';

        if (normalizedValue.length < 3 || normalizedValue.length > 100) {
            throw new InvalidReportNameError();
        }

        return new ReportName({ value: normalizedValue });
    }

    get value(): string {
        return this.props.value;
    }
}
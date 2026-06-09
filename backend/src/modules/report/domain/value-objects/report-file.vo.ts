import { InvalidReportFileError } from '../errors/report-domain.errors';

export class ReportFile {
    private constructor(private readonly props: { value: string | null }) { }

    static create(value?: string | null): ReportFile {
        if (value === undefined || value === null) {
            return new ReportFile({ value: null });
        }

        const normalizedValue = value.trim();

        if (normalizedValue.length === 0) {
            return new ReportFile({ value: null });
        }

        if (normalizedValue.length > 500) {
            throw new InvalidReportFileError();
        }

        return new ReportFile({ value: normalizedValue });
    }

    get value(): string | null {
        return this.props.value;
    }
}
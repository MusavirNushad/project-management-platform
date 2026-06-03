// src/modules/workspace/domain/value-objects/workspace-slug.vo.ts

import { InvalidWorkspaceSlugError } from '../errors/workspace-domain.errors';

export class WorkspaceSlug {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 120;

    private constructor(private readonly props: { value: string }) { }

    static create(value: string): WorkspaceSlug {
        const normalizedValue = value.trim().toLowerCase();

        if (normalizedValue.length < this.MIN_LENGTH) {
            throw new InvalidWorkspaceSlugError(
                `slug must be at least ${this.MIN_LENGTH} characters long`,
            );
        }

        if (normalizedValue.length > this.MAX_LENGTH) {
            throw new InvalidWorkspaceSlugError(
                `slug must not exceed ${this.MAX_LENGTH} characters`,
            );
        }

        if (!this.isValidSlug(normalizedValue)) {
            throw new InvalidWorkspaceSlugError(
                'slug may contain only lowercase letters, numbers, and hyphens',
            );
        }

        return new WorkspaceSlug({ value: normalizedValue });
    }

    static fromName(name: string): WorkspaceSlug {
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return WorkspaceSlug.create(slug);
    }

    get value(): string {
        return this.props.value;
    }

    equals(other: WorkspaceSlug): boolean {
        return this.value === other.value;
    }

    private static isValidSlug(value: string): boolean {
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

        return slugRegex.test(value);
    }
}
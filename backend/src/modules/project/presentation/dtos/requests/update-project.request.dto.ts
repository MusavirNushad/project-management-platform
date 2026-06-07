import {
    IsDateString,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateProjectRequestDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string | null;

    @IsOptional()
    @IsDateString()
    startDate?: string | null;

    @IsOptional()
    @IsDateString()
    dueDate?: string | null;

    @IsOptional()
    @IsIn(['ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED'])
    status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';
}
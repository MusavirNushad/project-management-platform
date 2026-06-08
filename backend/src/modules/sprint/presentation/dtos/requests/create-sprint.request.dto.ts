import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateSprintRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(150)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    goal?: string | null;

    @IsOptional()
    @IsDateString()
    startDate?: string | null;

    @IsOptional()
    @IsDateString()
    endDate?: string | null;
}

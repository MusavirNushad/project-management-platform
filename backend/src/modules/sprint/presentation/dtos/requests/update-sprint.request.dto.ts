import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSprintRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  goal?: string | null;

  @IsOptional()
  @IsIn(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  status?: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

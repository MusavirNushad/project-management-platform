import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorklogRequestDto {
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string | null;
}

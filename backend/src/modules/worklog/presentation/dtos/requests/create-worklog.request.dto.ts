import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWorklogRequestDto {
  @IsDateString()
  @IsNotEmpty()
  startedAt!: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string | null;
}

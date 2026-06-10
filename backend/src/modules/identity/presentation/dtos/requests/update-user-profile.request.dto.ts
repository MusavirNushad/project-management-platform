import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserProfileRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;
}

import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class AddTaskToSprintRequestDto {
  @IsUUID()
  @IsNotEmpty()
  taskId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position?: number | null;
}

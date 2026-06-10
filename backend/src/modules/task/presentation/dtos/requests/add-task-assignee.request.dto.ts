import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddTaskAssigneeRequestDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

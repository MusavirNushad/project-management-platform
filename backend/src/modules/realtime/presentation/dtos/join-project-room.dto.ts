import { IsUUID } from 'class-validator';

export class JoinProjectRoomDto {
  @IsUUID()
  projectId!: string;
}

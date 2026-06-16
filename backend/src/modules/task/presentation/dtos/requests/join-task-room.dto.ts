import { IsUUID } from 'class-validator';

export class JoinTaskRoomDto {
    @IsUUID()
    taskId!: string;
}
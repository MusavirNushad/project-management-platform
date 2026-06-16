import { IsUUID } from 'class-validator';

export class JoinWorkspaceRoomDto {
    @IsUUID()
    workspaceId!: string;
}
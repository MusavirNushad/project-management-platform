import { IsUUID } from 'class-validator';

export class RemoveWorkspaceMemberSocketDto {
    @IsUUID()
    workspaceId!: string;

    @IsUUID()
    memberId!: string;
}
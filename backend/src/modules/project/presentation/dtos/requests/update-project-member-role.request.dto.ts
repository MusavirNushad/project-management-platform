import { IsIn } from 'class-validator';

export class UpdateProjectMemberRoleRequestDto {
    @IsIn(['ADMIN', 'MEMBER'])
    roleName!: 'ADMIN' | 'MEMBER';
}

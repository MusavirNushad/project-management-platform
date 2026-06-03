import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';

export class AddWorkspaceMemberRequestDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsIn(['ADMIN', 'MEMBER'])
    roleName!: 'ADMIN' | 'MEMBER';
}
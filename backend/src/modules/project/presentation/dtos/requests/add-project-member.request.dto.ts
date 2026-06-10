import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';

export class AddProjectMemberRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsIn(['ADMIN', 'MEMBER'])
  roleName!: 'ADMIN' | 'MEMBER';
}

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTaskCommentRequestDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    body!: string;
}

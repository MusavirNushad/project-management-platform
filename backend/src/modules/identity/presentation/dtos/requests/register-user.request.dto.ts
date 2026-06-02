import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(80)
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(72)
    password!: string;
}


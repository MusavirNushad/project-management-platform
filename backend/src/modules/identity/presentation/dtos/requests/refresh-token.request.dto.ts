import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshTokenRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(5000)
    refreshToken!: string;
}

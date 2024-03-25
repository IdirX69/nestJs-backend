import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetUserPasswordDto {
  @IsNotEmpty()
  @MinLength(3)
  password: string;

  @IsString()
  token: string;
}

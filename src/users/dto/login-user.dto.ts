import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LogUserDto {
  @IsEmail({}, { message: 'Votre adresse email doit etre valide !' })
  email: string;
  @IsNotEmpty()
  @MinLength(3)
  password: string;
}

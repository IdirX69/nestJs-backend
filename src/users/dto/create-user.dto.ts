import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Votre adresse email doit etre valide !' })
  email: string;
  @IsNotEmpty()
  @MinLength(3)
  password: string;
  @IsString({ message: 'Indiquez votre Nom' })
  name: string;
}

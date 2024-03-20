import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Votre adresse email doit etre valide !' })
  email: string;
  @IsNotEmpty()
  @MinLength(3)
  password: string;
  @IsString({ message: 'Indiquez votre nom et prénom' })
  firstname: string;
  @IsString({ message: 'Indiquez votre nom et prénom' })
  lastname: string;
  @IsString({ message: 'Indiquez votre adresse postale' })
  address: string;
}

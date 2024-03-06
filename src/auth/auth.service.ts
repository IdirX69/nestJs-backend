import { Injectable } from '@nestjs/common';
import { AuthBody } from '../auth/auth.controller';
import { PrismaService } from 'src/users/prisma.service';
import { compare, hash } from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async login({ authBody }: { authBody: AuthBody }) {
    const { password, email } = authBody;
    const hashedPassword = await this.hashedPassword({ password });
    console.log(hashedPassword, password);

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      throw new Error("L'utilisateur n'existe pas");
    }
    const isPasswordSame = await this.verifyPassword({
      password,
      hashedPassword: existingUser.password,
    });
    if (!isPasswordSame) {
      throw new Error('Le mot de passe est invalide');
    }
    return existingUser.id;
  }

  private async hashedPassword({ password }: { password: string }) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }
  private async verifyPassword({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    const verifyPassword = await compare(password, hashedPassword);
    return verifyPassword;
  }
}

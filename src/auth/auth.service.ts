import { Injectable } from '@nestjs/common';
import { AuthBody } from '../auth/auth.controller';
import { PrismaService } from 'src/users/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async login({ authBody }: { authBody: AuthBody }) {
    const { password, email } = authBody;
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      throw new Error("L'utilisateur n'existe pas");
    }
    const isPasswordSame = password === existingUser.password;
    if (!isPasswordSame) {
      throw new Error('Le mot de passe est invalide');
    }
    return existingUser;
  }
}

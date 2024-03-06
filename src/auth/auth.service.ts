import { Injectable } from '@nestjs/common';
import { AuthBody } from '../auth/auth.controller';
import { PrismaService } from 'src/users/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async login({ authBody }: { authBody: AuthBody }) {
    const { password, email } = authBody;

    // const hashedPassword = await this.hashedPassword({ password });

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
    return await this.authenticateUser({ userId: existingUser.id });
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
  private async authenticateUser({ userId }: { userId: number }) {
    const payload = { userId };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

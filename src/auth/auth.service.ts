import { Injectable } from '@nestjs/common';
import { AuthBody } from '../../dist/auth/auth.controller';
import { PrismaService } from 'src/users/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async login({ authBody }: { authBody: AuthBody }) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: authBody.email
      },
});
    if (!existingUser) {
      throw new Error("L'utilisateur n'existe pas");
}
    return existingUser;
  }
}

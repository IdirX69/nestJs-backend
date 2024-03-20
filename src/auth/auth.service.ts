import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/users/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LogUserDto } from 'src/users/dto/login-user.dto';
import { MailerService } from 'src/users/mailer.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  async login({ authBody }: { authBody: LogUserDto }) {
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

  async register({ registerBody }: { registerBody: CreateUserDto }) {
    try {
      const { firstname, email, password, address, lastname } = registerBody;

      const existingUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        throw new Error('Un compte existe déja avec cette email !');
      }
      const hashedPassword = await this.hashedPassword({ password });
      const createdUser = await this.prisma.user.create({
        data: {
          firstname,
          email,
          password: hashedPassword,
          address,
          lastname,
        },
      });

      await this.mailerService.sendCreatedAccountEmail({
        recepient: email,
        firstname: firstname,
      });

      return this.authenticateUser({ userId: createdUser.id });
    } catch (error) {
      return { error: true, message: error.message };
    }
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
  private async authenticateUser({ userId }: UserPayload) {
    const payload: UserPayload = { userId };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

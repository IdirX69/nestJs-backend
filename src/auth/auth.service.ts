import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/users/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LogUserDto } from 'src/users/dto/login-user.dto';
import { MailerService } from 'src/users/mailer.service';
import { createId } from '@paralleldrive/cuid2';
import { ResetUserPasswordDto } from 'src/users/dto/reset-user-password';

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

  async resetUserPasswordRequest({ email }: { email: string }) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas");
      }
      if (existingUser.isResettingPassword === true) {
        throw new Error(
          'Une demande de réinitiallisation de mot de passe est déja en cours',
        );
      }
      const createdId = createId();
      await this.prisma.user.update({
        where: { email },
        data: { isResettingPassword: true, resetPasswordToken: createdId },
      });
      await this.mailerService.sendRequestedPasswordEmail({
        recepient: existingUser.email,
        firstname: existingUser.email,
        token: createdId,
      });
      return {
        error: false,
        message:
          'Veuillez vérifier vos email por réinitialiser votre mot de passe !',
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  async resetUserPassword({
    resetPasswordDto,
  }: {
    resetPasswordDto: ResetUserPasswordDto;
  }) {
    try {
      const { password, token } = resetPasswordDto;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });
      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas");
      }
      if (existingUser.isResettingPassword === false) {
        throw new Error(
          'Aucune demande de réinitiallisation de mot de passe en cours',
        );
      }

      const hashedPassword = await this.hashedPassword({ password });

      await this.prisma.user.update({
        where: { resetPasswordToken: token },
        data: { isResettingPassword: false, password: hashedPassword },
      });

      return {
        error: false,
        message: 'Votre mot de passe a bien été changée',
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  async verifyResetPasswordToken({ token }: { token: string }) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });
      if (!existingUser) {
        throw new Error('l utilisateur existe pas');
      }
      if (existingUser.isResettingPassword === false) {
        throw new Error(
          'Aucune demande de réinitiallisation de mot de passe est en cours',
        );
      }

      return {
        error: false,
        message: 'Le token est valide',
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}

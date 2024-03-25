import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LogUserDto } from 'src/users/dto/login-user.dto';
import { ResetUserPasswordDto } from 'src/users/dto/reset-user-password';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @Post('login')
  async login(@Body() authBody: LogUserDto) {
    console.log({ authBody });
    return await this.authService.login({ authBody });
  }
  @Post('register')
  async register(@Body() registerBody: CreateUserDto) {
    console.log({ registerBody });
    return await this.authService.register({ registerBody });
  }
  @Post('request-reset-password')
  async requestUserPassword(@Body('email') email: string) {
    console.log('email to restet password' + { email });
    return await this.authService.resetUserPasswordRequest({ email });
  }
  @Post('reset-password')
  async resetUserPassword(@Body() resetPasswordDto: ResetUserPasswordDto) {
    return await this.authService.resetUserPassword({ resetPasswordDto });
  }
  @Get('verify-reset-password-token')
  async verifyResetPasswordToken(@Query('token') token: string) {
    console.log(token + { token });
    return await this.authService.verifyResetPasswordToken({ token });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAuthenticatedUser(@Request() request: RequestWithUser) {
    return await this.userService.findOne(request.user.userId);
  }
}

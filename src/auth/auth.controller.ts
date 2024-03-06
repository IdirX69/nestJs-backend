import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UsersService } from 'src/users/users.service';

export type AuthBody = { email: string; password: string };
export type CreateUser = { email: string; name: string; password: string };
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @Post('login')
  async login(@Body() authBody: AuthBody) {
    console.log({ authBody });
    return await this.authService.login({ authBody });
  }
  @Post('register')
  async register(@Body() registerBody: CreateUser) {
    console.log({ registerBody });
    return await this.authService.register({ registerBody });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async authenticateUser(@Request() request: RequestWithUser) {
    return await this.userService.findOne(request.user.userId);
  }
}

import { Controller, Get, Req, Query, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserRole } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Query('role') role: UserRole) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Query('role') role: UserRole) {
    return this.authService.googleLogin(req.user, role);
  }

  @Post('complete-signup')
  async completeSignup(
    @Body() body: { userId: number; password: string; specialization?: string }
  ) {
    return this.authService.completeSignup(
      body.userId,
      body.password,
      body.specialization
    );
  }
}

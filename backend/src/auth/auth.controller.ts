import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Start Google OAuth
   * Example: /auth/google?state=patient
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Query('state') state: string) {
    // Nothing needed here; Passport handles redirect to Google
  }

  /**
   * Google OAuth callback
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(req.user);
    return res.json(tokens);
  }

  /**
   * Complete user profile (password + specialization)
   * Requires JWT token in Authorization header
   */
  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  async completeProfile(@Req() req, @Body() body: any) {
    const { password, confirmPassword, specialization } = body;
    return this.authService.completeProfile(
      req.user.sub, // user ID from JWT
      password,
      confirmPassword,
      specialization,
    );
  }
}

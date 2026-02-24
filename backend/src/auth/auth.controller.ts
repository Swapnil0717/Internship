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
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { CompleteProfileDto } from './dto/complete-profile';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Start Google OAuth
   * Example:
   * GET /auth/google?state=doctor
   * GET /auth/google?state=patient
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Query('state') state: string) {
    // Passport handles redirect
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
   * Complete user profile
   * Requires JWT access token
   */
  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  async completeProfile(
    @Req() req,
    @Body() dto: CompleteProfileDto,
  ) {
    return this.authService.completeProfile(req.user.sub, dto);
  }
}

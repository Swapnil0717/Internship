import { Injectable, BadRequestException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../user/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'https://internship-production-4f70.up.railway.app',
      scope: ['email', 'profile'],
      passReqToCallback: true,
      prompt: 'select_account consent',
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const state = req.query.state;

    if (!state || !['doctor', 'patient'].includes(state)) {
      throw new BadRequestException(
        'Role must be selected before Google login',
      );
    }

    const role =
      state === 'doctor'
        ? UserRole.DOCTOR
        : UserRole.PATIENT;

    return {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      role, // ✅ ENUM, NOT STRING
    };
  }
}

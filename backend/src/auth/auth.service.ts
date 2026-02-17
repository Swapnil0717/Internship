import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../user/user.entity';
import { CompleteProfileDto } from './dto/complete-profile';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // GOOGLE LOGIN
  // =========================
  async googleLogin(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
  }) {
    let user = await this.userRepo.findOne({
      where: { email: data.email },
    });

    if (!user) {
      const newUser: DeepPartial<User> = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phoneNumber: data.phoneNumber,
        isProfileCompleted: false,
      };

      user = this.userRepo.create(newUser);
      await this.userRepo.save(user);
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // =========================
  // COMPLETE PROFILE ✅
  // =========================
// =========================
// COMPLETE PROFILE
// =========================
async completeProfile(userId: number, dto: CompleteProfileDto) {
  const { password, confirmPassword, phoneNumber, specialization } = dto;

  if (password !== confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }

  const user = await this.userRepo.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Hash password
  user.password = await bcrypt.hash(password, 10);

  // Save phone
  user.phoneNumber = phoneNumber;

  // If doctor, specialization required
  if (user.role === UserRole.DOCTOR) {
    if (!specialization) {
      throw new BadRequestException(
        'Doctor must provide specialization',
      );
    }

    user.specialization = specialization;
  }

  user.isProfileCompleted = true;

  await this.userRepo.save(user);

  return { message: 'Profile completed successfully' };
}
  // =========================
  // TOKENS
  // =========================
  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, { refreshToken: hashed });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      const valid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!valid) {
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

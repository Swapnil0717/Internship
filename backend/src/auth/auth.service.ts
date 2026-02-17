import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async googleLogin(data: any) {
    // Check if user exists
    let user = await this.userRepo.findOne({ where: { email: data.email } });

    if (!user) {
      // Create new user
      user = this.userRepo.create({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isProfileCompleted: false,
      });

      await this.userRepo.save(user);
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async completeProfile(userId: number, password: string, confirmPassword: string, specialization?: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;

    if (user.role === 'doctor') {
      if (!specialization) throw new BadRequestException('Doctor must provide specialization');
      user.specialization = specialization;
    }

    user.isProfileCompleted = true;
    await this.userRepo.save(user);

    return { message: 'Profile completed successfully' };
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, { refreshToken: hashed });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });

      if (!user || !user.refreshToken) throw new UnauthorizedException();

      const match = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!match) throw new UnauthorizedException();

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

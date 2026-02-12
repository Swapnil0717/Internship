import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async googleLogin(googleUser: any, role: UserRole) {
    let user = await this.userRepo.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = this.userRepo.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        role: role || UserRole.PATIENT,
      });
      await this.userRepo.save(user);
    }

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return { user, token };
  }

  async completeSignup(userId: number, password: string, specialization?: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    user.password = await bcrypt.hash(password, 10);
  
    if (user.role === UserRole.DOCTOR) {
      user.specialization = specialization;
    }
  
    return this.userRepo.save(user);
  }
  
}

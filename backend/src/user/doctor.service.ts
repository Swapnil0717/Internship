import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllDoctors() {
    return this.userRepository.find({
      where: { role: UserRole.DOCTOR },
      select: ['id', 'firstName', 'lastName' ,'email', 'specialization'],
    });
  }

  async getDoctorsBySpecialization(specialization: string) {
    return this.userRepository.find({
      where: {
        role: UserRole.DOCTOR,
        specialization,
      },
      select: ['id', 'firstName', 'lastName', 'email', 'specialization'],
    });
  }
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class UserModule {}
import { Controller, Get, Param } from '@nestjs/common';
import { DoctorService } from './doctor.service';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // GET /doctor
  @Get()
  async getAllDoctors() {
    return this.doctorService.getAllDoctors();
  }

  // GET /doctor/specialization/:specialization
  @Get('specialization/:specialization')
  async getDoctorsBySpecialization(
    @Param('specialization') specialization: string,
  ) {
    return this.doctorService.getDoctorsBySpecialization(specialization);
  }
}
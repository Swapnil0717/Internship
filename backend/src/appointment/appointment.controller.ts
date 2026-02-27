import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';

import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}

  // =====================================================
  // BOOK SLOT
  // =====================================================

  @Post('book/:slotId')
  book(
    @Param('slotId', ParseIntPipe) slotId: number,
    @Req() req,
  ) {
    if (req.user.role !== 'PATIENT') {
      throw new ForbiddenException('Only patients can book');
    }

    return this.service.bookAppointment(
      req.user.sub,
      slotId,
    );
  }

  // =====================================================
  // CANCEL
  // =====================================================

  @Post('cancel/:id')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.service.cancelAppointment(
      id,
      req.user.sub,
    );
  }

  // =====================================================
  // MY APPOINTMENTS (PATIENT)
  // =====================================================

  @Get('patient')
  patient(@Req() req) {
    if (req.user.role !== 'PATIENT') {
      throw new ForbiddenException();
    }

    return this.service.getPatientAppointments(
      req.user.sub,
    );
  }

  // =====================================================
  // MY APPOINTMENTS (DOCTOR)
  // =====================================================

  @Get('doctor')
  doctor(@Req() req) {
    if (req.user.role !== 'DOCTOR') {
      throw new ForbiddenException();
    }

    return this.service.getDoctorAppointments(
      req.user.sub,
    );
  }
}
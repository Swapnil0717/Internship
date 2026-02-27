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

  constructor(
    private service: AppointmentService,
  ) {}

  @Post('book/:slotId')
  book(
    @Param('slotId', ParseIntPipe) slotId: number,
    @Req() req,
  ) {

    if (req.user.role !== 'PATIENT')
      throw new ForbiddenException();

    return this.service.bookAppointment(
      req.user.sub,
      slotId,
    );
  }

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

  @Get('patient')
  patient(@Req() req) {

    return this.service.getPatientAppointments(
      req.user.sub,
    );
  }

  @Get('doctor')
  doctor(@Req() req) {

    return this.service.getDoctorAppointments(
      req.user.sub,
    );
  }
}
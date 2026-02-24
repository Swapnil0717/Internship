import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private service: AppointmentService) {}

  // ✅ BOOK SLOT
  @Post()
  create(@Req() req, @Body() dto: { slotId: number }) {
    return this.service.createBooking(req.user.sub, dto);
  }

  // ✅ CANCEL BOOKING
  @Delete(':id')
  cancel(@Param('id') id: string, @Req() req) {
    return this.service.cancelBooking(+id, req.user.sub);
  }

  // ✅ VIEW MY BOOKINGS
  @Get('me')
  myAppointments(@Req() req) {
    return this.service.getMyAppointments(req.user.sub);
  }
}

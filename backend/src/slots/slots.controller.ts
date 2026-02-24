import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  ForbiddenException,
} from '@nestjs/common';

import { SlotService } from './slots.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('slots')
@UseGuards(JwtAuthGuard)
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post()
  createSlot(@Body() dto, @Req() req) {
    if (req.user.role !== 'DOCTOR')
      throw new ForbiddenException();

    return this.slotService.createSlot(dto, req.user);
  }

  @Get('doctor')
  getDoctorSlots(@Req() req) {
    return this.slotService.getDoctorSlots(req.user.sub);
  }

  @Post('elastic-update')
  elasticUpdate(@Req() req, @Body() body) {
    if (req.user.role !== 'DOCTOR')
      throw new ForbiddenException();

    return this.slotService.updateSlotElasticity(
      req.user.sub,
      body.slotId,
      body.newStartTime,
      body.newEndTime,
    );
  }
}
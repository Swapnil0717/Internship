import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
} from '@nestjs/common';

import { CreateSlotDto } from './dto/create-slot.dto';
import { RecurringSlotDto } from './dto/recurring-slot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SlotService } from './slots.service';

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  // Custom slot
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() dto: CreateSlotDto) {
    return this.slotService.createSlot(req.user.sub, dto);
  }

  // Multi-day recurring slot
  @Post('recurring')
  @UseGuards(JwtAuthGuard)
  createRecurring(@Req() req, @Body() dto: RecurringSlotDto) {
    return this.slotService.createRecurringSlots(req.user.sub, dto);
  }

  // View doctor slots
  @Get('doctor')
  @UseGuards(JwtAuthGuard)
  getMySlots(@Req() req) {
    return this.slotService.getDoctorSlots(req.user.sub);
  }

  // Cancel slot
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Req() req, @Param('id') id: string) {
    return this.slotService.cancelSlot(+id, req.user.sub);
  }
}

import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { RecurringSlotDto } from './dto/recurring-slot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('slots')
@UseGuards(JwtAuthGuard)
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  createSlot(@Req() req, @Body() dto: CreateSlotDto) {
    return this.slotsService.createSlot(req.user.sub, dto);
  }

  @Post('recurring')
  createRecurring(@Req() req, @Body() dto: RecurringSlotDto) {
    return this.slotsService.createRecurringSlots(req.user.sub, dto);
  }

  @Get('doctor')
  getDoctorSlots(
    @Req() req,
    @Query('includeCancelled') includeCancelled: string,
  ) {
    return this.slotsService.getDoctorSlots(
      req.user.sub,
      includeCancelled === 'true',
    );
  }
}

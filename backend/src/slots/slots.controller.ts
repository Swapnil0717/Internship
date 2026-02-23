import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createSlot(@Req() req, @Body() dto: CreateSlotDto) {
    // ✅ correct order: dto first, doctorId second
    return this.slotsService.createSlot(dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor')
  getDoctorSlots(@Req() req) {
    return this.slotsService.getDoctorSlots(req.user.sub);
  }
}
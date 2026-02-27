import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ElasticSlotDto } from './dto/elastic-update.dto';

@Controller('slots')
@UseGuards(JwtAuthGuard)
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.slotsService.createSlot(body, req.user.id);
  }

  @Get()
  getMySlots(@Req() req: any) {
    return this.slotsService.getDoctorSlots(req.user.id);
  }

  @Post('elastic')
  elastic(
    @Body() dto: { mainSlotId: number; newEndTime: string },
    @Req() req: any,
  ) {
    const slotId = Number(dto.mainSlotId);
  
    if (isNaN(slotId)) {
      throw new BadRequestException('Invalid mainSlotId');
    }
  
    return this.slotsService.elasticUpdate(
      slotId,
      dto.newEndTime,
      req.user.id, // ✅ now service accepts 3 params
    );
  }
  }

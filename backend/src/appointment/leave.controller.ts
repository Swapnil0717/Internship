import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
  } from '@nestjs/common';

  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaveService } from './LeaveService';
@Controller('leave')
@UseGuards(JwtAuthGuard)

export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
  ) {}

  @Post()
  addLeave(@Body() dto, @Req() req) {
    return this.leaveService.addLeave(
      dto,
      req.user,
    );
  }
}
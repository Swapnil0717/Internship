import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaveService } from './leave.service';

@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
  ) {}

  @Post()
  addLeave(@Body() dto, @Req() req) {

    if (req.user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctor can apply leave');
    }

    return this.leaveService.addLeave(
      dto,
      req.user,
    );
  }
}
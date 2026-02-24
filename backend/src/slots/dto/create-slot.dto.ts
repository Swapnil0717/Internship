import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { SlotMode, SlotType } from '../slot.entity';

export class CreateSlotDto {
  @IsString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(SlotType)
  slotType: SlotType;

  @IsEnum(SlotMode)
  mode: SlotMode;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

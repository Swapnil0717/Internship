import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { SlotMode } from '../slot.enums';


export class RecurringSlotDto {
  @IsArray()
  @IsString({ each: true })
  days: string[]; // ["Monday", "Tuesday"]

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(SlotMode)
  mode: SlotMode;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

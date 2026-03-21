import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ArrayNotEmpty,
  IsDateString,
  Min,
} from 'class-validator';

import { SlotMode, SlotType, SessionType } from '../slot.enums';

export class CreateSlotDto {
  /* ================= Recurring Slots ================= */

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  days?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  /* ================= Single Date Slot ================= */

  @IsOptional()
  @IsDateString()
  date?: string;

  /* ================= Time ================= */

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  /* ================= Slot Properties ================= */

  @IsOptional()
  @IsEnum(SlotMode)
  mode?: SlotMode;

  @IsOptional()
  @IsEnum(SlotType)
  slotType?: SlotType;

  @IsEnum(SessionType)
  session: SessionType;

  /* ================= Capacity ================= */

  @IsNumber()
  @Min(1)
  maxPatient: number;

  @IsNumber()
  @Min(1)
  duration: number; // minutes per patient
}
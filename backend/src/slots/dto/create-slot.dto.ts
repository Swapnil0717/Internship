import { SlotMode, SlotType, SessionType } from '../slot.enums';

export class CreateSlotDto {
  days?: string[];

  startDate?: string;
  endDate?: string;

  date?: string;

  startTime: string;
  endTime: string;

  mode?: SlotMode;

  slotType?: SlotType;

  maxPatient: number;

  session: SessionType;

  duration: number; // minutes per patient
}
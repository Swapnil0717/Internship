import { IsArray, IsDateString, IsString, Matches } from 'class-validator';

export class RecurringSlotDto {
  @IsArray()
  @IsString({ each: true })
  days: string[]; // ["Monday", "Tuesday"]

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;
}

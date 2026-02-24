import { IsNumber, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  slotId: number;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;
}

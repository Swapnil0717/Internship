import { IsUUID, IsString, Matches } from 'class-validator';

export class ElasticSlotDto {
  @IsUUID()
  mainSlotId: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  newEndTime: string; // HH:mm
}
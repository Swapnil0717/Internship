import { MinLength, IsOptional, IsNotEmpty } from 'class-validator';

export class CompleteProfileDto {
  @MinLength(6)
  password: string;

  @MinLength(6)
  confirmPassword: string;

  @MinLength(10)
  phoneNumber: string;

  @IsOptional()
  @IsNotEmpty()
  specialization?: string;
}

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterPatientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @MinLength(6)
  confirmPassword: string;

  @MinLength(10)
  phoneNumber: string;
}

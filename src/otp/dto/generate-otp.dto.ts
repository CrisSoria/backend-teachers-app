import { IsNotEmpty, IsEmail } from 'class-validator';

export class GenerateOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

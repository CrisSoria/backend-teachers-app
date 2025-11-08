import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('generate')
  generate(@Body() generateOtpDto: GenerateOtpDto) {
    return this.otpService.generateOTP(generateOtpDto.email);
  }

  @Post('validate')
  validate(@Body() validateOtpDto: ValidateOtpDto) {
    return this.otpService.validateOTP(validateOtpDto.email, validateOtpDto.token);
  }

}

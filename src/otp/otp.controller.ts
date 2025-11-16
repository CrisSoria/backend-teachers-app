import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { ApiGenerateOtp, ApiValidateOtp } from './decorators/swagger.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  /*
   * Genera un OTP para el email
   * POST /otp/generate
   */
  @Post('generate')
  @ApiGenerateOtp()
  generate(@Body() generateOtpDto: GenerateOtpDto) {
    const otp = this.otpService.generateOTP(generateOtpDto.email);
    return { message: 'OTP generado exitosamente', otp };
  }

  /*
   * Valida un OTP para el email
   * POST /otp/validate
   */
  @Post('validate')
  @ApiValidateOtp()
  validate(@Body() validateOtpDto: ValidateOtpDto) {
    const isValid = this.otpService.validateOTP(
      validateOtpDto.email,
      validateOtpDto.token,
    );
    return { message: 'OTP validado exitosamente', isValid };
  }
}

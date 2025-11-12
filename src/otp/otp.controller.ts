import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  /*
   * Genera un OTP para el email
   * POST /otp/generate
   */
  @Post('generate')
  @ApiOperation({ summary: 'Generar OTP' })
  @ApiBody({ type: GenerateOtpDto })
  @ApiResponse({ status: 200, description: 'OTP generado exitosamente' })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  generate(@Body() generateOtpDto: GenerateOtpDto) {
    const otp = this.otpService.generateOTP(generateOtpDto.email);
    return { message: 'OTP generado exitosamente', otp };
  }

  /*
   * Valida un OTP para el email
   * POST /otp/validate
   */
  @Post('validate')
  @ApiOperation({ summary: 'Validar OTP' })
  @ApiBody({ type: ValidateOtpDto })
  @ApiResponse({ status: 200, description: 'OTP validado exitosamente' })
  @ApiResponse({ status: 400, description: 'OTP inválido' })
  validate(@Body() validateOtpDto: ValidateOtpDto) {
    const isValid = this.otpService.validateOTP(
      validateOtpDto.email,
      validateOtpDto.token,
    );
    return { message: 'OTP validado exitosamente', isValid };
  }
}

import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

// Decorador para el endpoint de generar OTP
export function ApiGenerateOtp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Generar OTP',
      description: 'Permite generar un OTP para un email.',
    }),
    ApiBody({
      schema: {
        example: {
          email: 'email@gmail.com',
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'OTP generado exitosamente',
      schema: {
        example: { message: 'OTP generado exitosamente', otp: 'otp' },
      },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
  );
}

// Decorador para el endpoint de validar OTP
export function ApiValidateOtp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Validar OTP',
      description: 'Permite validar un OTP para un email.',
    }),
    ApiBody({
      schema: {
        example: {
          email: 'email@gmail.com',
          token: 'otp',
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'OTP validado exitosamente',
      schema: {
        example: { message: 'OTP validado exitosamente', isValid: true },
      },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
  );
}

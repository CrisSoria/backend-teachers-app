import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

// Decorador para el endpoint de crear asistencia
export function ApiSendEmail() {
  return applyDecorators(
    ApiOperation({
      summary: 'Enviar email',
      description: 'Permite enviar un email a un usuario.',
    }),
    ApiBody({
      schema: {
        example: {
          recipients: ['email1@gmail.com', 'email2@gmail.com'],
          subject: 'Prueba',
          html: '<h1>Prueba</h1>',
          text: 'Prueba',
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Email enviado exitosamente',
      schema: {
        example: {
          message: 'Email enviado exitosamente',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
  );
}

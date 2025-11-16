import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';

// Decorador para el endpoint de registro
export function ApiRegister() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registar nuevo usuario',
      description: 'Crea un usuario y envia un OTP para verificar su correo.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            example: 'Password123!',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Usuario registrado exitosamente',
      schema: {
        example: {
          message:
            'Usuario registrado exitosamente. Se ha enviado el código para verificar la cuenta al email: ' +
            'newUser.email',
          user: 'newUser',
          otp: 'otp',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
  );
}

// Decorador para el endpoint de login
export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Iniciar sesión y generar JWT',
      description: 'Retorna access_token y refresh_token',
    }),
    ApiBody({
      schema: {
        example: {
          email: 'user@example.com',
          password: 'Password123#',
          otp: '123456',
        },
      },
    }),
    ApiResponse({
      description: 'Login exitoso',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_in: 900,
          user: {
            id: '507f1f77bcf86cd799439011',
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Sin asistencias registradas' }),
  );
}

// Decorador para el endpoint de renovar access token
export function ApiRefreshToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'Renovar access token',
      description: 'Renova el access token usando el refresh token.',
    }),
    ApiBody({
      schema: {
        example: {
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({
      description: 'Token renovado exitosamente',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_in: 900,
          user: {
            id: '507f1f77bcf86cd799439011',
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({
      status: 401,
      description: 'Refresh token inválido o expirado',
    }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'refresh token no encontrado' }),
  );
}

// Decorador para el endpoint de cerrar sesión
export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cerrar sesión actual',
      description:
        'Invalida el access token actual y elimina el refresh token.',
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer <token>',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Sesión cerrada exitosamente',
      schema: {
        example: {
          message: 'Sesión cerrada exitosamente',
          success: true,
        },
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
  );
}

// Decorador para el endpoint de cerrar todas las sesiones del usuario
export function ApiLogoutAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cerrar todas las sesiones del usuario',
      description:
        'Invalida el access token actual y elimina el refresh token.',
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer <token>',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Sesión cerrada exitosamente',
      schema: {
        example: {
          message: 'Sesión cerrada exitosamente',
          success: true,
        },
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
  );
}

// Decorador para el endpoint de obtener perfil del usuario autenticado
export function ApiProfile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener perfil del usuario autenticado',
      description: 'Retorna el perfil del usuario autenticado.',
    }),
    ApiResponse({
      status: 200,
      description: 'Perfil obtenido exitosamente',
      schema: {
        example: {
          id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          name: 'John Doe',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
  );
}

// Decorador para el endpoint de cambio de contraseña
export function ApiChangePassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cambio de contraseña',
      description: 'Valida el token OTP y cambia la contraseña del usuario.',
    }),
    ApiBody({
      schema: {
        example: {
          token: '123456',
          newPassword: 'Password123!',
          email: 'user@example.com',
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Contraseña cambiada exitosamente',
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Usuario no encontrado' }),
  );
}

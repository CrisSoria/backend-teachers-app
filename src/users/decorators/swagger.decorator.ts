import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';

// Decorador para el endpoint de crear usuario
export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo usuario',
      description: 'Permite a un administrador crear un usuario.',
    }),
    ApiBody({
      schema: {
        example: {
          name: 'Juan Pérez',
          birthdate: '2020-01-01',
          gender: 'Masculino',
          order: 1,
          photo: 'https://example.com/photo.jpg',
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Usuario creado exitosamente',
      schema: {
        example: {
          message: 'Usuario creado exitosamente',
          user: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Juan Pérez',
            birthdate: '2020-01-01',
            gender: 'Masculino',
            order: 1,
            photo: 'https://example.com/photo.jpg',
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
  );
}

// Decorador para obtener todos los usuarios
export function ApiFindAllUsers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los usuarios',
      description:
        'Retorna todos los usuarios registrados. Solo puede ser accedido por administradores.',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuarios encontrados',
      schema: {
        example: {
          message: 'Usuarios encontrados',
          users: [
            {
              _id: '507f1f77bcf86cd799439011',
              name: 'Juan Pérez',
              birthdate: '2020-01-01',
              gender: 'Masculino',
              order: 1,
              photo: 'https://example.com/photo.jpg',
            },
          ],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Sin usuarios registrados' }),
  );
}

// Decorador para buscar usuario por ID
export function ApiFindOneUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener usuario por ID',
      description:
        'Extrae los datos del JWT para revisar si el usuario autenticado es quien está pidiendo sus datos o es un administrador.',
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Token de autenticación',
      example:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      example: { message: 'Usuario obtenido exitosamente', user: {} },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Usuario no encontrado' }),
  );
}

// Decorador para actualizar usuario
export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar usuario',
      description: 'Actualiza los datos de un usuario existente.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({ status: 200, description: 'Usuario actualizado' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Usuario no encontrado' }),
  );
}

// Decorador para eliminar usuario
export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar usuario',
      description: 'Elimina permanentemente un usuario del sistema.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuario eliminado',
      example: {
        message: 'Usuario eliminado exitosamente',
        studentDeleted: {},
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Usuario no encontrado' }),
  );
}

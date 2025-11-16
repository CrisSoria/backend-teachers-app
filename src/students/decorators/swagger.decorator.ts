import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';

// Decorador para el endpoint de crear estudiantes
export function ApiCreateStudent() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo estudiante',
      description: 'Permite a un profesor crear un registro de estudiante.',
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
      description: 'Estudiante creado exitosamente',
      schema: {
        example: {
          message: 'Estudiante creado exitosamente',
          student: {
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

// Decorador para obtener estudiantes por usuario
export function ApiFindAllByUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los estudiantes de un usuario',
      description:
        'Retorna todos los estudiantes registrados para un usuario específico.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario',
      example: '507f191e810c19729de860ea',
    }),
    ApiResponse({
      status: 200,
      description: 'Estudiantes encontrados',
      schema: {
        example: {
          message: 'Estudiantes encontrados',
          students: [
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
    ApiResponse({ status: 404, description: 'Sin estudiantes registrados' }),
  );
}

// Decorador para buscar asistencia por mes
export function ApiFindMyStudents() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener estudiantes del usuario autenticado',
      description:
        'Extrae los datos del JWT para obtener los estudiantes del usuario autenticado.',
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Token de autenticación',
      example:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    }),
    ApiResponse({
      example: { message: 'Estudiantes obtenidos exitosamente', students: [] },
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Estudiantes no encontrados' }),
  );
}

// Decorador para buscar por ID
export function ApiFindOneStudent() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener estudiante por ID',
      description: 'Busca un estudiante específico por su ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del estudiante',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      example: { message: 'Estudiante obtenido exitosamente', student: {} },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Asistencia no encontrada' }),
  );
}

// Decorador para actualizar asistencia
export function ApiUpdateStudent() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar estudiante',
      description: 'Actualiza los datos de un estudiante existente.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del estudiante',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({ status: 200, description: 'Estudiante actualizado' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Asistencia no encontrada' }),
  );
}

// Decorador para eliminar asistencia
export function ApiDeleteStudent() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar estudiante',
      description: 'Elimina permanentemente un estudiante del sistema.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del estudiante',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Estudiante eliminado',
      example: {
        message: 'Estudiante eliminado exitosamente',
        studentDeleted: {},
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Estudiante no encontrado' }),
  );
}

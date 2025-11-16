import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

// Decorador para el endpoint de crear asistencia
export function ApiCreateAttendance() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva asistencia',
      description: 'Permite a un profesor crear un registro de asistencia para un mes específico.',
    }),
    ApiBody({
      schema: {
        example: {
          userId: '507f191e810c19729de860ea',
          month: 'enero',
          data: [
            { student: 'Juan Pérez', '1': 'P', '2': 'A', '3': 'P' }
          ]
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Asistencia creada exitosamente',
      schema: {
        example: {
          message: 'Asistencia creada exitosamente',
          attendance: {
            _id: '507f1f77bcf86cd799439011',
            userId: '507f191e810c19729de860ea',
            month: 'Enero',
            data: [{ student: 'Juan Pérez', '1': 'P', '2': 'A' }],
          }
        }
      }
    }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
  );
}

// Decorador para obtener asistencias por usuario
export function ApiFindAllByUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las asistencias de un usuario',
      description: 'Retorna todas las asistencias registradas para un usuario específico.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario',
      example: '507f191e810c19729de860ea',
    }),
    ApiResponse({
      status: 200,
      description: 'Asistencias encontradas',
      schema: {
        example: {
          message: 'Asistencias encontradas',
          attendance: [
            {
              _id: '507f1f77bcf86cd799439011',
              userId: '507f191e810c19729de860ea',
              month: 'Enero',
              data: [{ student: 'Juan Pérez', '1': 'P' }],
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Sin asistencias registradas' }),
  );
}

// Decorador para buscar asistencia por mes
export function ApiFindOneAttendance() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener asistencia por usuario y mes',
      description: 'Busca la asistencia de un usuario para un mes determinado.',
    }),
    ApiBody({
      schema: {
        example: {
          userId: '507f191e810c19729de860ea',
          month: 'Enero'
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Asistencia encontrada' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Asistencia no encontrada' }),
  );
}

// Decorador para buscar por ID
export function ApiFindByIdAttendance() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener asistencia por ID',
      description: 'Busca una asistencia específica por su ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la asistencia',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({ status: 200, description: 'Asistencia encontrada' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Asistencia no encontrada' }),
  );
}

// Decorador para actualizar asistencia
export function ApiUpdateAttendance() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar asistencia',
      description: 'Actualiza los datos de una asistencia existente.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la asistencia',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({ status: 200, description: 'Asistencia actualizada' }),
    ApiResponse({ status: 400, description: 'Datos inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Asistencia no encontrada' }),
  );
}

// Decorador para eliminar asistencia
export function ApiDeleteAttendance() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar asistencia',
      description: 'Elimina permanentemente una asistencia del sistema.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la asistencia',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({ status: 200, description: 'Asistencia eliminada' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 403, description: 'Prohibido' }),
    ApiResponse({ status: 404, description: 'Asistencia no encontrada' }),
  );
}
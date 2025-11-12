/*
 quizas conviene reemplarzar por una función que reciba el JWT + el campo que contiene el user id.
 🤔 Usa Guard cuando:
Necesitas verificar permisos ANTES de cualquier lógica
No necesitas el recurso en el controller
Quieres autorización declarativa a nivel de ruta
Ejemplo: Verificar rol ANTES de acceder a admin panel
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectConnection() private connection: Connection,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si es admin, permitir acceso completo
    if (user.role === 'admin') {
      return true;
    }

    // Obtener metadata del decorador @CheckOwnership()
    const ownershipConfig = this.reflector.get<{
      model: string;
      userField?: string;
      paramName?: string;
    }>('ownership', context.getHandler());

    // Si no hay configuración de ownership, permitir acceso
    if (!ownershipConfig) {
      return true;
    }

    const {
      model,
      userField = 'userId', // Campo por defecto
      paramName = 'id', // Parámetro por defecto
    } = ownershipConfig;

    // Obtener el ID del recurso desde los parámetros
    const resourceId = request.params[paramName];

    if (!resourceId) {
      // Si no hay ID en los params, permitir (ej: POST create)
      return true;
    }

    try {
      // Obtener el modelo dinámicamente
      const Model = this.connection.model(model);

      // Buscar el recurso
      const resource = await Model.findById(resourceId).lean();

      if (!resource) {
        throw new NotFoundException(`${model} no encontrado`);
      }

      // Verificar ownership
      const resourceUserId = resource[userField];

      if (!resourceUserId) {
        throw new ForbiddenException(
          `El recurso no tiene un campo ${userField} válido`,
        );
      }

      // Comparar userId del recurso con userId del token
      if (resourceUserId.toString() !== user.userId.toString()) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a este recurso',
        );
      }

      return true;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new ForbiddenException('Error al verificar permisos');
    }
  }
}

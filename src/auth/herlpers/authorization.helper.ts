import { ForbiddenException } from '@nestjs/common';
import { IAuthUser } from '../interfaces/auth-user.interface';
import { UserRole } from 'src/users/interfaces/user-role.enum';

export interface ResourceWithOwner {
  userId?: any;
  createdBy?: any;
  ownerId?: any;
  [key: string]: any;
}

/**
 * Verifica si el usuario tiene permiso para acceder a un recurso
 * @param user - Usuario del JWT (req.user)
 * @param resource - Recurso que se intenta acceder
 * @param ownerField - Campo que contiene el userId del dueño (default: 'userId')
 * @throws ForbiddenException si no tiene permisos
 */
export function checkResourceOwnership(
  user: IAuthUser,
  resource: ResourceWithOwner | null,
  ownerField: string = 'userId',
): void {
  // Si no existe el recurso, no hacer nada (el controller lanzará NotFoundException)
  if (!resource) {
    return;
  }

  // Admin siempre tiene acceso
  if (user.role === UserRole.ADMIN) {
    return;
  }

  // Obtener el userId del recurso
  const resourceUserId = resource[ownerField];

  if (!resourceUserId) {
    throw new ForbiddenException(
      `El recurso no tiene un campo ${ownerField} válido`,
    );
  }

  // Comparar userId del recurso con userId del token
  if (resourceUserId.toString() !== user.userId.toString()) {
    throw new ForbiddenException(
      'No tienes permiso para acceder a este recurso',
    );
  }
}

/**
 * Verifica si el usuario puede acceder a recursos de otro usuario
 * @param user - Usuario del JWT (req.user)
 * @param targetUserId - ID del usuario objetivo
 * @throws ForbiddenException si no tiene permisos
 */
export function checkUserAccess(user: IAuthUser, targetUserId: string): void {
  // Admin siempre tiene acceso
  if (user.role === UserRole.ADMIN) {
    return;
  }

  // Usuario solo puede acceder a sus propios recursos
  if (user.userId.toString() !== targetUserId.toString()) {
    throw new ForbiddenException(
      'No tienes permiso para acceder a recursos de otros usuarios',
    );
  }
}

/**
 * Verifica si el usuario tiene uno de los roles especificados
 * @param user - Usuario del JWT (req.user)
 * @param allowedRoles - Array de roles permitidos
 * @throws ForbiddenException si no tiene el rol necesario
 */
export function checkRole(user: IAuthUser, allowedRoles: string[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenException(
      `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
    );
  }
}

/**
 * Verifica si el usuario es admin
 * @param user - Usuario del JWT (req.user)
 * @returns true si es admin, false si no lo es
 */
export function isAdmin(user: IAuthUser): boolean {
  return user.role === UserRole.ADMIN;
}

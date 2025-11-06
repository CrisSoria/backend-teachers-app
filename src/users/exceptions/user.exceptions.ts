import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(id: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuario no encontrado',
        error: `No se encontró el usuario con ID: ${id}`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UserEmailAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      {
        message: 'El correo electrónico ya está registrado',
        error: `El email ${email} ya existe en el sistema`,
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidUserDataException extends HttpException {
  constructor(errors: string[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Datos de usuario inválidos',
        errors: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UserUpdateFailedException extends HttpException {
  constructor(id: string, reason?: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar el usuario',
        error: reason || `No se pudo actualizar el usuario con ID: ${id}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class UserDeletionFailedException extends HttpException {
  constructor(id: string, reason?: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al eliminar el usuario',
        error: reason || `No se pudo eliminar el usuario con ID: ${id}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
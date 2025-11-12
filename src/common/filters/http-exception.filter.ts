import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Error interno del servidor',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        // Extraer toda la información de la excepción
        errorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          ...exceptionResponse, // Spread para mantener todos los campos
        };
      } else {
        errorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: exceptionResponse as string,
        };
      }
    } else if (exception instanceof Error) {
      // Error no controlado
      this.logger.error(
        `Error no controlado: ${exception.message}`,
        exception.stack,
      );

      errorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: 'Error interno del servidor',
        error:
          process.env.NODE_ENV === 'development'
            ? exception.message
            : undefined,
      };
    }

    // Log del error (solo en desarrollo mostrar stack completo)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - Status: ${status}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status: ${status} - ${errorResponse.message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}

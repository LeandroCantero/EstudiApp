import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

/**
 * Se usa un catch genérico para evitar problemas de resolución de tipos en el IDE con clases generadas.
 */
@Catch()
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Verificamos si es un error conocido de Prisma por su estructura y código
    if (exception.code && typeof exception.code === 'string' && exception.code.startsWith('P')) {
      switch (exception.code) {
        case 'P2002': {
          const status = HttpStatus.CONFLICT;
          return response.status(status).json({
            statusCode: status,
            message: 'Error de restricción: Ya existe un registro con este campo único.',
            timestamp: new Date().toISOString(),
          });
        }
        case 'P2025': {
          const status = HttpStatus.NOT_FOUND;
          return response.status(status).json({
            statusCode: status,
            message: 'No se encontró el registro solicitado.',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Si no es un error de Prisma manejado, delegamos al filtro base o al global
    super.catch(exception, host);
  }
}

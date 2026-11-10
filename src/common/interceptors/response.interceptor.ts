/**
 * Módulo: Shared
 * Archivo: response.interceptor.ts
 * Descripción:
 * Interceptor global que estandariza las respuestas de la API,
 * incorporando los campos success, status y data.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Define la estructura estándar de respuesta de la API.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export interface ApiResponse<T> {
  /** Indica si la operación fue exitosa. */
  success: boolean;

  /** Código HTTP de la respuesta. */
  status: number;

  /** Información devuelta por la operación. */
  data: T;
}

/**
 * Interceptor encargado de transformar las respuestas
 * de los controladores al formato estándar de la API.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  /**
   * Intercepta la respuesta del controlador y la envuelve
   * en la estructura estándar de la API.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        return {
          success: true,
          status: response.statusCode,
          data: data !== undefined ? data : (null as unknown as T),
        };
      }),
    );
  }
}

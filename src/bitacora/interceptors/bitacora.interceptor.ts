import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { BitacoraService } from '../bitacora.service';
import {
  BITACORA_KEY,
  BITACORA_IGNORE_KEY,
  BitacoraOptions,
} from '../bitacora.decorator';

@Injectable()
export class BitacoraInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private bitacoraService: BitacoraService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 1. Verificar si debemos ignorar la bitácora
    const ignore = this.reflector.get<boolean>(
      BITACORA_IGNORE_KEY,
      context.getHandler(),
    );

    if (ignore) {
      return next.handle();
    }

    // 2. Obtener las opciones del decorador
    const options = this.reflector.get<BitacoraOptions>(
      BITACORA_KEY,
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    // 3. Obtener el request de forma segura
    const req = context.switchToHttp().getRequest();
    const params = req.params ?? {};
    const body = req.body ?? {};      // ✅ Evita undefined
    const query = req.query ?? {};    // ✅ Evita undefined
    const user = req.user ?? {};      // ✅ Evita undefined

    // 4. Determinar el registroId de forma segura
    const registroId =
      params.id ??
      body.id ??
      body.registroId ??
      query.id ??
      undefined;

    // 5. Determinar el sistemaId de forma segura
    const sistemaId =
      options.sistemaId ??
      body.sistemaId ??
      query.sistemaId ??
      params.sistemaId ??
      req.sistemaId ??
      user.sistemaId ??
      undefined;

    const timestamp = new Date();

    return next.handle().pipe(
      map((response) => {
        // 6. Si no tenemos registroId, intentar obtenerlo de la respuesta
        const finalRegistroId =
          registroId ??
          response?.id ??
          response?.data?.id ??
          'unknown';

        // 7. Registrar en bitácora sin bloquear la respuesta
        this.bitacoraService
          .createFromRequest(
            {
              tablaAfectada: options.tabla,
              registroId: finalRegistroId,
              accion: options.accion,
              datosAnteriores:
                options.accion === 'UPDATE' || options.accion === 'DELETE'
                  ? { id: finalRegistroId }
                  : undefined,
              datosNuevos: options.omitirDatos
                ? undefined
                : options.accion === 'DELETE'
                  ? { eliminado: true, id: finalRegistroId }
                  : response,
              sistemaId,
            },
            req,
          )
          .catch((error) => {
            console.error('Error al registrar en bitácora:', error);
          });

        return response;
      }),
      catchError((error) => {
        // 8. Registrar errores en bitácora
        this.bitacoraService
          .createFromRequest(
            {
              tablaAfectada: options.tabla,
              registroId: registroId ?? 'error',
              accion: options.accion,
              datosAnteriores:
                options.accion === 'UPDATE' || options.accion === 'DELETE'
                  ? { id: registroId }
                  : undefined,
              datosNuevos: {
                error: error.message,
                status: error.status || 500,
                timestamp: timestamp.toISOString(),
              },
              sistemaId,
            },
            req,
          )
          .catch((err) => {
            console.error('Error al registrar error en bitácora:', err);
          });

        throw error;
      }),
    );
  }
}
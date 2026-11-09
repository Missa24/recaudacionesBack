import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BitacoraService } from '../bitacora.service';

@Injectable()
export class BitacoraMiddleware implements NestMiddleware {
  constructor(private bitacoraService: BitacoraService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Solo registrar accesos a endpoints específicos
    const ignoredPaths = ['/bitacora', '/auth', '/health'];
    const path = req.path;

    // Ignorar ciertas rutas
    if (ignoredPaths.some(p => path.startsWith(p))) {
      return next();
    }

    // Guardar la hora de inicio
    const startTime = Date.now();

    // Interceptar el evento 'finish' para obtener el status code
    res.on('finish', async () => {
      // Solo registrar si es una petición exitosa o error
      // No registrar GET para no llenar la bitácora
      if (req.method === 'GET' && res.statusCode < 400) {
        return;
      }

      const duration = Date.now() - startTime;

      try {
        await this.bitacoraService.createFromRequest(
          {
            tablaAfectada: 'acceso',
            registroId:
              typeof req.params?.id === 'string'
                ? req.params.id
                : typeof req.query?.id === 'string'
                  ? req.query.id
                  : 'unknown',
            accion: req.method === 'GET' ? 'LEER' : req.method as any,
            datosAnteriores: undefined,
            datosNuevos: {
              method: req.method,
              path: req.path,
              query: req.query,
              statusCode: res.statusCode,
              duration: `${duration}ms`,
            },
          },
          req,
        );
      } catch (error) {
        console.error('Error en middleware de bitácora:', error);
      }
    });

    next();
  }
}
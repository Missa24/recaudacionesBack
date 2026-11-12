/**
 * Módulo: Seguridad - Módulo
 * Archivo: map-response-modulo.util.ts
 *
 * Transforma una entidad Modulo en su estructura de respuesta.
 */

import { Modulo } from '../entities/modulo.entity';
import { ModuloResponse } from '../interfaces/modulo-response.interface';

export function mapearRespuesta(modulo: Modulo): ModuloResponse {
  return {
    id: modulo.id,
    nombre: modulo.nombre,
    codigo: modulo.codigo,
    descripcion: modulo.descripcion,
    ruta: modulo.ruta,
    estado: modulo.estado,

    responsable_creacion: modulo.usuario_creador?.username ?? null,
    responsable_actualizacion: modulo.usuario_actualizador?.username ?? null,
  };
}

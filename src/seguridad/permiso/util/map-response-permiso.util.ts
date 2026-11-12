/**
 * Módulo: Seguridad - Permiso
 * Archivo: map-response-permiso.util.ts
 * Descripción:
 * Transforma una entidad Permiso en su estructura de respuesta.
 */

import { Permiso } from '../entities/permiso.entity';
import { PermisoResponse } from '../interfaces/permiso-response.interface';

export function mapearRespuesta(permiso: Permiso): PermisoResponse {
  return {
    id: permiso.id,
    codigo: permiso.codigo,
    descripcion: permiso.descripcion,
    estado: permiso.estado,
    responsable_creacion: permiso.usuario_creador?.username ?? null,
    responsable_actualizacion: permiso.usuario_actualizador?.username ?? null,
  };
}

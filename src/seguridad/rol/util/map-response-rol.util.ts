/**
 * Módulo: Seguridad - Rol
 * Archivo: map-response-rol.util.ts
 * Descripción:
 * Proporciona una función auxiliar para transformar una entidad Rol
 * en su estructura de respuesta.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { Rol } from '../entities/rol.entity';
import { RolResponse } from '../interfaces/rol-response.interface';

/**
 * Función: mapearRespuesta
 * Descripción:
 * Transforma una entidad Rol en su estructura de respuesta.
 *
 * Incluye los datos de los responsables de creación,
 * actualización y eliminación cuando sus relaciones están disponibles.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export function mapearRespuesta(rol: Rol): RolResponse {
  return {
    id: rol.id,
    codigo: rol.codigo,
    descripcion: rol.descripcion,
    estado: rol.estado,

    responsable_creacion: rol.usuario_creador?.username ?? null,
    responsable_actualizacion: rol.usuario_actualizador?.username ?? null,
    responsable_eliminacion: rol.usuario_eliminador?.username ?? null,
  };
}

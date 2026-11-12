/**
 * Módulo: Seguridad - Sesión
 * Archivo: map-response-sesion.util.ts
 * Descripción:
 * Proporciona una función auxiliar para transformar
 * entidades Sesion en estructuras de respuesta.
 */

import { Sesion } from '../entities/sesion.entity';
import { SesionResponse } from '../interface/sesion-response.interface';

/**
 * Transforma una entidad Sesion en su estructura de respuesta.
 *
 * Incluye información del usuario propietario y responsables
 * de creación y actualización.
 */
export function mapearRespuesta(sesion: Sesion): SesionResponse {
  return {
    id: sesion.id,
    usuario_id: sesion.usuario_id,
    username: sesion.usuario?.username ?? null,
    inicio: sesion.inicio,
    fin: sesion.fin,
    ipAddress: sesion.ipAddress,
    userAgent: sesion.userAgent,
    estado: sesion.estado,

    responsable_creacion: sesion.usuario_creador?.username ?? null,
    responsable_actualizacion: sesion.usuario_actualizador?.username ?? null,
  };
}

/**
 * Módulo: Catálogos - Calendario
 * Archivo: calendario.mapper.ts
 * Descripción:
 * Contiene la función auxiliar que transforma una entidad Calendario
 * en la estructura pública utilizada en las respuestas del servicio.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { Calendario } from '../entities/calendario.entity';
import { CalendarioResponse } from '../interface/calendario-response.interface';

/**
 * Convierte una entidad Calendario a la estructura
 * pública definida para las respuestas del servicio.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export function mapearCalendario(calendario: Calendario): CalendarioResponse {
  return {
    id: calendario.id,
    fecha: calendario.fecha,
    dia_habil: calendario.dia_habil,
    descripcion: calendario.descripcion,
    estado: calendario.estado,
    responsable_creacion: calendario.usuario_creador?.username ?? null,
    responsable_actualizacion:
      calendario.usuario_actualizador?.username ?? null,
  };
}

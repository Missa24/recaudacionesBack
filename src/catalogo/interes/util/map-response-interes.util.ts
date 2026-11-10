/**
 * Módulo: Catálogo - interes
 * Archivo: map-response-interes.util.ts
 * Descripción:
 * Proporciona una función auxiliar para mapear
 * datos de los intereses.
 *
 * Desarrollado por: Missael Apaza
 */

import { Interes } from '../entities/interes.entity';
import { InteresResponse } from '../interface/interes-response.interface';

/**
 * Transforma una entidad UFV en su estructura de respuesta.
 *
 * Incluye los datos de los responsables de creación
 * y actualización cuando sus relaciones están disponibles.
 *
 * Desarrollado por: Missael Apaza
 */
export function mapearRespuesta(interes: Interes): InteresResponse {
  return {
    id: interes.id,
    fecha_publicacion: interes.fecha_publicacion,
    valor: String(interes.valor),
    estado: interes.estado,
    responsable_creacion: interes.usuario_creador?.username ?? null,
    responsable_actualizacion: interes.usuario_actualizador?.username ?? null,
  };
}

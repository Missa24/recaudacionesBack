/**
 * Módulo: Catálogo - UFV
 * Archivo: map-response-ufv.util.ts
 * Descripción:
 * Proporciona una función auxiliar para mapear
 * datos de los intereses.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { Ufv } from '../entities/ufv.entity';
import { UfvResponse } from '../interface/ufv-response.interface';

/**
 * Transforma una entidad UFV en su estructura de respuesta.
 *
 * Incluye los datos de los responsables de creación
 * y actualización cuando sus relaciones están disponibles.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export function mapearRespuesta(ufv: Ufv): UfvResponse {
  return {
    id: ufv.id,
    fecha: ufv.fecha,
    valor: String(ufv.valor),
    estado: ufv.estado,
    responsable_creacion: ufv.usuario_creador?.username ?? null,
    responsable_actualizacion: ufv.usuario_actualizador?.username ?? null,
  };
}

/**
 * Módulo: Catálogo - Requisito
 * Archivo: map-response-requisito.util.ts
 * Descripción:
 * Proporciona una función auxiliar para mapear
 * datos de los requisitos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { Requisito } from '../entities/requisito.entity';
import { RequisitoResponse } from '../interface/requisito-response.interface';

/**
 * Transforma una entidad Requisito en su estructura de respuesta.
 *
 * Incluye los datos de los responsables de creación,
 * actualización y baja lógica cuando sus relaciones están disponibles.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export function mapearRespuesta(requisito: Requisito): RequisitoResponse {
  return {
    id_requisito: requisito.id_requisito,
    codigo: requisito.codigo,
    descripcion: requisito.descripcion,
    estado: requisito.estado,
    responsable_creacion: requisito.usuario_creador?.username ?? null,
    responsable_actualizacion: requisito.usuario_actualizador?.username ?? null,
    responsable_eliminacion: requisito.usuario_eliminador?.username ?? null,
  };
}

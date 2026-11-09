/**
 * Módulo: Catálogo - Dependencia
 * Archivo: map-response-dependencia.util.ts
 * Descripción:
 * Proporciona una función auxiliar para mapear
 * datos de los intereses.
 *
 * Desarrollado por: Missael Apaza
 */

import { Dependencia } from '../entities/dependencia.entity';
import { DependenciaResponse } from '../interface/dependencia-response.interface';

/**
 * Transforma una entidad Dependencia en su estructura de respuesta.
 *
 * Incluye los datos de los responsables de creación
 * y actualización cuando sus relaciones están disponibles.
 *
 * Desarrollado por: Missael Apaza
 */
export function mapearRespuesta(dependencia: Dependencia): DependenciaResponse {
  return {
    id: dependencia.id,
    codigo: dependencia.codigo,
    nombre: dependencia.nombre,
    abreviacion: dependencia.abreviacion,
    es_unidad_desconcentrada: dependencia.es_unidad_desconcentrada,
    estado: dependencia.estado,
    responsable_creacion: dependencia.usuario_creador
      ? { username: dependencia.usuario_creador.username }
      : null,
    responsable_actualizacion: dependencia.usuario_actualizador
      ? { username: dependencia.usuario_actualizador.username }
      : null,
  };
}

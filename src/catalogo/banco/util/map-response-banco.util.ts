/**
 * Módulo: Catálogo - Banco
 * Archivo: map-response-banco.util.ts
 * Descripción:
 * Proporciona una función auxiliar para mapear
 * datos de los intereses.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { Banco } from '../entities/banco.entity';
import { BancoResponse } from '../interface/banco-response.interface';

/**
 * Transforma una entidad Banco en su estructura de respuesta.
 *
 * Incluye los datos de los responsables de creación
 * y actualización cuando sus relaciones están disponibles.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export function mapearRespuesta(banco: Banco): BancoResponse {
  return {
    id: banco.id,
    nombre: banco.nombre,
    codigo_bc: banco.codigo_bc,
    estado: banco.estado,
    responsable_creacion: banco.usuario_creador?.username ?? null,
    responsable_actualizacion: banco.usuario_actualizador?.username ?? null,
  };
}

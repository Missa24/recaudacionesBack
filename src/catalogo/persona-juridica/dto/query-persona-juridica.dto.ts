/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: query-persona-juridica.dto.ts
 * Descripción:
 * Define los parámetros específicos de consulta y filtrado
 * para el listado paginado de personas jurídicas.
 *
 * Desarrollado por: Missael Apaza
 */

import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

/**
 * DTO para las consultas paginadas de personas jurídicas.
 * Hereda los parámetros generales de búsqueda, filtrado,
 * ordenamiento y paginación del DTO compartido.
 *
 * Desarrollado por: Missael Apaza
 */
export class QueryPersonaJuridicaDto extends QueryPaginatedDto {}

/**
 * Módulo: Seguridad - Rol
 * Archivo: query-rol.dto.ts
 * Descripción:
 * Define los parámetros de consulta específicos para los roles,
 * heredando los parámetros generales de búsqueda,
 * filtrado, ordenamiento y paginación.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

/**
 * DTO: QueryRolDto
 * Descripción:
 * Permite consultar los roles utilizando los parámetros
 * generales de paginación y búsqueda del sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export class QueryRolDto extends QueryPaginatedDto {}

/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: query-usuario-rol.dto.ts
 * Descripción:
 * Define los parámetros de consulta específicos para las
 * asignaciones de roles, heredando los parámetros generales
 * de búsqueda, filtrado y paginación.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryUsuarioRolDto extends QueryPaginatedDto {}

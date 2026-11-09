/**
 * Módulo: Shared
 * Archivo: paginated-response.interface.ts
 * Descripción:
 * Define la estructura general de respuesta para los listados
 * que utilizan paginación.
 *
 * Desarrollado por: Missael Apaza
 */

/**
 * Información de paginación de una consulta.
 * Desarrollado por: Missael Apaza
 */
export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Estructura genérica de respuesta paginada.
 * Desarrollado por: Missael Apaza
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

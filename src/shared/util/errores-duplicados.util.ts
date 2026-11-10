/**
 * Módulo: Shared - Utils
 * Archivo: errores-duplicados.util.ts
 * Descripción:
 * Proporciona una función auxiliar para identificar errores
 * de duplicidad generados por PostgreSQL mediante TypeORM.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { QueryFailedError } from 'typeorm';

/**
 * Determina si un error corresponde a una violación
 * de restricción de unicidad en PostgreSQL.
 *
 * Identifica el código SQLSTATE 23505, correspondiente
 * a registros duplicados.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export function esErrorDuplicado(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (
      error as QueryFailedError & {
        driverError: { code?: string };
      }
    ).driverError?.code === '23505'
  );
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { QueryPaginatedDto } from '../../../shared/dto/query-paginated.dto';

/**
 * Módulo: Seguridad / Asignaciones
 * Archivo: query-asignacion.dto.ts
 * Descripción:
 *   Hereda page, limit, search, status, sortBy, sortOrder y rango de fechas.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

export class QueryAsignacionDto extends QueryPaginatedDto {
  /** Fecha sobre la que se aplica el rango. Su propiedad real se resuelve en el servicio. */
  @ApiPropertyOptional({
    enum: ['createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'], {
    message: 'dateField debe ser createdAt o updatedAt.',
  })
  dateField: 'createdAt' | 'updatedAt' = 'createdAt';
}

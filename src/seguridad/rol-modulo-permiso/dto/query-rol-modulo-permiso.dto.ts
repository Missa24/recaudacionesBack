import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { QueryPaginatedDto } from '../../../shared/dto/query-paginated.dto';

/**
 * Archivo: query-rol-modulo-permiso.dto.ts
 * Descripción: Paginación, búsqueda y filtros de rol-modulo-permiso.
 * Fecha: 2026-11-11
 * Autor: Oscar Canchari
 */
export class QueryRolModuloPermisoDto extends QueryPaginatedDto {
  /** Fecha utilizada para aplicar startDate y endDate. */
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

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { QueryPaginatedDto } from '../../../shared/dto/query-paginated.dto';

/**
 * Archivo: query-usuario-rol.dto.ts
 * Descripción: Paginación, búsqueda y filtros de usuario-rol.
 * Fecha: 2026-11-11
 * Autor: Oscar Canchari
 */
export class QueryUsuarioRolDto extends QueryPaginatedDto {
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

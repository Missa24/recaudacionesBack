/**
 * Módulo: Catálogos - Calendario
 * Archivo: query-calendario.dto.ts
 * Descripción:
 * Define los parámetros de consulta, búsqueda, filtrado
 * y ordenamiento para los registros del calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

/**
 * DTO: QueryCalendarioDto
 * Descripción:
 * Extiende los parámetros generales de paginación
 * y agrega filtros específicos del calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class QueryCalendarioDto extends QueryPaginatedDto {
  /**
   * Filtra los registros según su condición de día hábil.
   */
  @ApiPropertyOptional({
    example: false,
    description: 'Filtra por condición de día hábil: true o false.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  habil?: boolean;
}

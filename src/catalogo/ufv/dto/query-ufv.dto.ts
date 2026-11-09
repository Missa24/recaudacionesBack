import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

/**
 * Módulo: Catálogo - UFV
 * Archivo: query-ufv.dto.ts
 * Descripción:
 * Define los parámetros de consulta específicos para los registros UFV,
 * heredando los parámetros generales de paginación.
 *
 * Desarrollado por: Missael Apaza
 */
export class QueryUfvDto extends QueryPaginatedDto {
  /**
   * Estado por el cual se filtrarán los registros UFV.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO'],
  })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'], {
    message:
      'El estado debe ser uno de los siguientes valores: ACTIVO o INACTIVO',
  })
  declare status?: string;
}

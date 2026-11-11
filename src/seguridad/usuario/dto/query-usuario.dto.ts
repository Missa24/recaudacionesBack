
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { QueryPaginatedDto } from '../../../shared/dto/query-paginated.dto';

/**
 * Módulo: Seguridad / Usuario
 *
 * Reutiliza TODOS los filtros de QueryPaginatedDto.
 *
 * Agrega dateField para elegir sobre qué fecha
 * se aplicará startDate y endDate.
 *
 * Desarrollado por: Oscar Canchari
 */
export class QueryUsuarioDto extends QueryPaginatedDto {
  @ApiPropertyOptional({
    description:
      'Campo de fecha utilizado para filtrar usuarios.',
    enum: ['createdAt', 'updatedAt'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'], {
    message: 'dateField debe ser createdAt o updatedAt.',
  })
  dateField: 'createdAt' | 'updatedAt' = 'createdAt';
}

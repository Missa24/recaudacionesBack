import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { QueryPaginatedDto } from '../../../shared/dto/query-paginated.dto';

/**
 * Reutiliza la paginación compartida y selecciona la fecha que se filtrará.
 * Desarrollado por: Oscar Canchari.
 */
export class QueryModuloDto extends QueryPaginatedDto {
  @ApiPropertyOptional({
    enum: ['createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  dateField: 'createdAt' | 'updatedAt' = 'createdAt';
}

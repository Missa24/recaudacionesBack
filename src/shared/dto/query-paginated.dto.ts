import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Módulo: Shared
 * Archivo: query-paginated.dto.ts
 * Descripción:
 * Define los parámetros generales de búsqueda, filtrado,
 * ordenamiento y paginación para las consultas del sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class QueryPaginatedDto {
  /**
   * Número de página solicitada.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page: number = 1;

  /**
   * Cantidad de registros por página.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  @Max(100, { message: 'El límite no debe ser mayor a 100' })
  limit: number = 10;

  /**
   * Campo por el cual se ordenarán los registros.
   * Los campos permitidos se determinan en cada servicio.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({ example: 'createdAt', default: 'createdAt' })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser un texto' })
  sortBy: string = 'createdAt';

  /**
   * Dirección del ordenamiento.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: 'El orden debe ser uno de los siguientes valores: ASC o DESC',
  })
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  /**
   * Término de búsqueda general.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({ example: 'juan' })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser un texto' })
  @MaxLength(100, {
    message: 'El término de búsqueda no debe superar los 100 caracteres',
  })
  search?: string;

  /**
   * Fecha inicial para filtrar registros.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha inicial debe tener un formato válido (AAAA-MM-DD)' },
  )
  startDate?: string;

  /**
   * Fecha final para filtrar registros.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha final debe tener un formato válido (AAAA-MM-DD)' },
  )
  endDate?: string;

  /**
   * Estado por el cual se filtrarán los registros.
   * Los valores admitidos dependen de cada módulo.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO', 'TODOS'],
    default: 'ACTIVO',
  })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'TODOS'], {
    message: 'El estado debe ser ACTIVO, INACTIVO o TODOS',
  })
  status?: string;
}

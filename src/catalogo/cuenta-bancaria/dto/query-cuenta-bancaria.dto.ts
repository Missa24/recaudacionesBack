/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: query-cuenta-bancaria.dto.ts
 * Descripción:
 * Define los parámetros específicos de consulta
 * para el listado de cuentas bancarias.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

/**
 * DTO para consultar el listado de cuentas bancarias.
 * Hereda los parámetros generales de búsqueda,
 * filtrado, ordenamiento y paginación.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class QueryCuentaBancariaDto extends QueryPaginatedDto {
  /**
   * Identificador del banco por el cual se filtrarán las cuentas.
   */
  @ApiPropertyOptional({
    example: '380b9ef8-2fc4-425e-8572-57a8d72a263c',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'El identificador del banco no es válido',
  })
  banco_id?: string;

  /**
   * Identificador de la dependencia por la cual se filtrarán las cuentas.
   */
  @ApiPropertyOptional({
    example: '646b0b24-4ca2-4cdd-89df-082046f76352',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'El identificador de la dependencia no es válido',
  })
  dependencia_id?: string;

  /**
   * Tipo de cuenta bancaria.
   */
  @ApiPropertyOptional({ example: 'RECAUDADORA' })
  @IsOptional()
  @IsString({ message: 'El tipo de cuenta debe ser un texto' })
  @MaxLength(30, {
    message: 'El tipo de cuenta no debe superar los 30 caracteres',
  })
  tipo?: string;
}

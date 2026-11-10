/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: query-persona-natural.dto.ts
 * Descripción:
 * Define los parámetros específicos de consulta y filtrado
 * para el listado paginado de personas naturales.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

/**
 * DTO para las consultas paginadas de personas naturales.
 * Hereda los parámetros generales de búsqueda, filtrado,
 * ordenamiento y paginación del DTO compartido.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class QueryPersonaNaturalDto extends QueryPaginatedDto {
  /*
   * Tipo de documento utilizado para filtrar los resultados.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026 */
  @ApiPropertyOptional({
    example: 'CI',
    description: 'Filtra las personas naturales por tipo de documento.',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @MaxLength(20, {
    message: 'El tipo de documento no debe superar los 20 caracteres',
  })
  tipo_documento?: string;

  /*
   * Estado civil utilizado para filtrar los resultados.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026 */
  @ApiPropertyOptional({
    example: 'NO DECLARADO',
    enum: ['NO DECLARADO'],
  })
  @IsOptional()
  @IsIn(['NO DECLARADO'], {
    message:
      'El estado civil debe ser uno de los siguientes valores: NO DECLARADO',
  })
  estado_civil?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

/**
 * Módulo: Seguridad - RolModuloPermiso
 * Archivo: query-rol-modulo-permiso.dto.ts
 *
 * Define los parámetros de consulta de las asignaciones.
 */
export class QueryRolModuloPermisoDto extends QueryPaginatedDto {
  @ApiPropertyOptional({
    description: 'Filtrar asignaciones por identificador de rol.',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'El identificador del rol no es válido',
  })
  rol_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar asignaciones por identificador de módulo.',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'El identificador del módulo no es válido',
  })
  modulo_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar asignaciones por identificador de permiso.',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'El identificador del permiso no es válido',
  })
  permiso_id?: string;
}

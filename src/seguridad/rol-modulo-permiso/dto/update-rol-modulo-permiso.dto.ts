import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModuloPermisosDto } from './create-rol-modulo-permiso.dto';

/**
 * Archivo: update-rol-modulo-permiso.dto.ts
 * Descripción: Actualiza la selección completa de módulos y permisos del rol.
 * Autor: Oscar Canchari.
 */
export class UpdateRolModuloPermisoDto {
  /** Selección completa; [] retira todos los accesos. */
  @ApiProperty({
    description:
      'Módulos y permisos del rol. Los accesos omitidos se retiran. [] retira todos.',
    type: () => [ModuloPermisosDto],
    minItems: 0,
    maxItems: 100,
  })
  @IsArray({
    message: 'modulos debe ser un arreglo.',
  })
  @ArrayMaxSize(100, {
    message: 'Se permiten hasta 100 módulos.',
  })
  @ArrayUnique((modulo: ModuloPermisosDto) => modulo?.idModulo?.toLowerCase(), {
    message: 'No debe repetir módulos.',
  })
  @ValidateNested({ each: true })
  @Type(() => ModuloPermisosDto)
  modulos!: ModuloPermisosDto[];
}

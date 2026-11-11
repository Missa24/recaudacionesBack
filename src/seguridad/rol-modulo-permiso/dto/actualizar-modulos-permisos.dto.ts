import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  ValidateNested,
} from "class-validator";
import { ModuloPermisosDto } from "./asignar-modulos-permisos.dto";

/**
 * Módulo: Seguridad / Rol Módulo Permiso
 * Archivo: actualizar-modulos-permisos.dto.ts
 * Descripción:
 *   Valida módulos y permisos agrupados para configurar un rol.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

export class ActualizarModulosPermisosDto {
  /** Selección completa. [] retira todos los accesos del rol. */
  @ApiProperty({ type: () => [ModuloPermisosDto], minItems: 0, maxItems: 100 })
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((item: ModuloPermisosDto) => item?.idModulo)
  @ValidateNested({ each: true })
  @Type(() => ModuloPermisosDto)
  modulos!: ModuloPermisosDto[];
}

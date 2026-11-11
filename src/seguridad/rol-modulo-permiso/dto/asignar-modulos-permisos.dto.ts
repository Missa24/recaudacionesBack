import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
  ValidateNested,
} from "class-validator";

/**
 * Módulo: Seguridad / Rol Módulo Permiso
 * Archivo: asignar-modulos-permisos.dto.ts
 * Descripción:
 *   Valida módulos y permisos agrupados para configurar un rol.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

/** Un módulo con una selección de acciones. La asignación requiere al menos una. */
export class ModuloPermisosDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("all")
  idModulo!: string;

  /** No admite permisos repetidos dentro del módulo. */
  @ApiProperty({ type: [String], minItems: 1, maxItems: 100 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID("all", { each: true })
  idsPermisos!: string[];
}

export class AsignarModulosPermisosDto {
  /** Rol que recibirá los accesos. */
  @ApiProperty({ format: "uuid" })
  @IsUUID("all")
  idRol!: string;
  /** Módulos cuyos permisos se agregarán sin retirar asignaciones existentes. */
  @ApiProperty({ type: () => [ModuloPermisosDto], minItems: 1, maxItems: 100 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique((item: ModuloPermisosDto) => item?.idModulo)
  @ValidateNested({ each: true })
  @Type(() => ModuloPermisosDto)
  modulos!: ModuloPermisosDto[];
}

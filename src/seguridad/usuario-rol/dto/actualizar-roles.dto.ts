import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayUnique, IsArray, IsUUID } from "class-validator";

/**
 * Módulo: Seguridad / Usuario Rol
 * Archivo: actualizar-roles.dto.ts
 * Descripción:
 *   Representa la selección completa deseada de roles de un usuario.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

export class ActualizarRolesDto {
  /** Vacío retira todos. Los incluidos quedan activos; los omitidos se eliminan lógicamente. */
  @ApiProperty({
    type: [String],
    maxItems: 100,
    example: [],
    description: "Selección completa. [] quita todos los roles.",
  })
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID("all", { each: true })
  idsRoles!: string[];
}

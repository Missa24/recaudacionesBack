import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

/**
 * Módulo: Seguridad / Usuario Rol
 * Archivo: asignar-roles.dto.ts
 * Descripción:
 *   Valida la asignación de uno o varios roles a un usuario existente.
 * Fecha de creación: 2026-11-11
 * Autor: Oscar Canchari
 */

export class AsignarRolesDto {
  /** Usuario receptor de los roles; no es el responsable de auditoría. */
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('all', { message: 'idUsuario debe ser un UUID válido.' })
  idUsuario!: string;

  /** Entre uno y cien roles diferentes en una misma operación. */
  @ApiProperty({
    type: [String],
    minItems: 1,
    maxItems: 100,
    example: ['550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  idsRoles!: string[];
}

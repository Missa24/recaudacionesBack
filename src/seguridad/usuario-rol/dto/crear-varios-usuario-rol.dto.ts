/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: asignar-varios-usuario-rol.dto.ts
 * Descripción:
 * Define los roles que se asignarán a un usuario en una sola operación.
 */

import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AsignarVariosUsuarioRolDto {
  @ApiProperty({
    description: 'Lista de identificadores UUID de los roles a asignar.',
    example: [
      '8b461287-8416-412e-84e7-b5c77615ea2a',
      '9b461287-8416-412e-84e7-b5c77615ea2b',
    ],
    type: [String],
  })
  @IsArray({ message: 'Los roles deben enviarse como una lista' })
  @ArrayNotEmpty({ message: 'Debe seleccionar al menos un rol' })
  @ArrayUnique({ message: 'No se permiten roles duplicados' })
  @IsUUID('4', {
    each: true,
    message: 'Cada rol debe tener un identificador UUID válido',
  })
  roles!: string[];
}

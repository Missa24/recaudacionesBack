/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: desactivar-varios-usuario-rol.dto.ts
 * Descripción:
 * Define los roles que se desactivarán para un usuario.
 */

import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class DesactivarVariosUsuarioRolDto {
  @ApiProperty({
    description: 'Lista de identificadores UUID de los roles a desactivar.',
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

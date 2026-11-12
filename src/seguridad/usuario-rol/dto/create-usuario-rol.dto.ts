/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: create-usuario-rol.dto.ts
 * Descripción:
 * Define los datos y validaciones necesarios para asignar
 * un rol a un usuario del sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUsuarioRolDto {
  /**
   * Identificador UUID del usuario al que se asignará el rol.
   */
  @ApiProperty({
    description: 'Identificador UUID del usuario.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'El usuario no puede estar vacío' })
  @IsUUID('4', {
    message: 'El identificador del usuario debe ser un UUID válido',
  })
  usuario_id!: string;

  /**
   * Identificador UUID del rol que será asignado.
   */
  @ApiProperty({
    description: 'Identificador UUID del rol.',
    example: 'c1a1f287-8416-412e-84e7-b5c77615ea2a',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'El rol no puede estar vacío' })
  @IsUUID('4', {
    message: 'El identificador del rol debe ser un UUID válido',
  })
  rol_id!: string;
}

/**
 * Módulo: Seguridad - Rol
 * Archivo: create-rol.dto.ts
 * Descripción:
 * Define los datos y validaciones necesarios para registrar
 * un nuevo rol dentro del sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

/**
 * DTO: CreateRolDto
 * Descripción:
 * Define los campos permitidos para crear un rol.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export class CreateRolDto {
  /**
   * Código funcional único del rol.
   */
  @ApiProperty({
    description: 'Código funcional único que identifica al rol.',
    example: 'ADMINISTRADOR',
    maxLength: 40,
  })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  @IsString({ message: 'El código debe ser un texto' })
  @MaxLength(40, {
    message: 'El código no debe superar los 40 caracteres',
  })
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'El código solo permite letras mayúsculas, números y guion bajo',
  })
  codigo!: string;

  /**
   * Descripción funcional del rol.
   */
  @ApiProperty({
    description: 'Descripción funcional del rol.',
    example: 'Rol con acceso administrativo al sistema',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(150, {
    message: 'La descripción no debe superar los 150 caracteres',
  })
  descripcion!: string;
}

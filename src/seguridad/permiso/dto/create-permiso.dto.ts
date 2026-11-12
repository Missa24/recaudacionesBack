/**
 * Módulo: Seguridad - Permiso
 * Archivo: create-permiso.dto.ts
 * Descripción:
 * Define los datos necesarios para registrar un permiso.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermisoDto {
  @ApiProperty({
    description: 'Código funcional único del permiso.',
    example: 'USUARIO_CREAR',
  })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  @IsString({ message: 'El código debe ser un texto' })
  @MaxLength(100, {
    message: 'El código no debe superar los 100 caracteres',
  })
  codigo!: string;

  @ApiProperty({
    description: 'Descripción funcional del permiso.',
    example: 'Permite registrar nuevos usuarios en el sistema.',
  })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion!: string;
}

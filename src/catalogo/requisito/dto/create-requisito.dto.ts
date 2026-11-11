/**
 * Módulo: Catálogo - Requisito
 * Archivo: create-requisito.dto.ts
 * Descripción:
 * Define los datos necesarios para registrar un nuevo requisito.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRequisitoDto {
  /**
   * Código único de identificación del requisito.
   */
  @ApiProperty({
    description: 'Código único de identificación del requisito.',
    example: 'REQ-001',
    maxLength: 50,
    type: String,
  })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  @IsString({ message: 'El código debe ser un texto' })
  @MaxLength(50, { message: 'El código no debe superar los 50 caracteres' })
  codigo!: string;

  /**
   * Descripción del documento requerido.
   */
  @ApiProperty({
    description: 'Descripción del documento requerido.',
    example: 'Fotocopia del carnet de identidad',
    maxLength: 300,
    type: String,
  })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(300, {
    message: 'La descripción no debe superar los 300 caracteres',
  })
  descripcion!: string;
}

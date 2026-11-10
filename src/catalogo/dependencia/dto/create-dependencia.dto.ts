/**
 * Módulo: Catálogos - Dependencia
 * Archivo: create-dependencia.dto.ts
 * Descripción:
 * Define las propiedades necesarias para registrar
 * una dependencia
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

/**
 * DTO: CreateDependenciaDto
 * Descripción:
 * Define los datos para registrar una Dependencia.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class CreateDependenciaDto {
  // Código funcional único de la dependencia
  @ApiProperty({
    example: 'DEMO-UNI',
    description: 'Código funcional único dentro de este cátalogo',
  })
  @IsString()
  @MaxLength(20, {
    message: 'El código solamente puede tener hasta 20 caracteres.',
  })
  codigo!: string;

  // Nombre de la dependencia
  @ApiProperty({
    example: 'Unidad de Atención de demostración',
    description: 'Nombre descriptivo del cátalogo',
  })
  @IsString()
  @MaxLength(200, {
    message: 'El código solamente puede tener hasta 200 caracteres.',
  })
  nombre!: string;

  // Abreviacion de la dependencia
  @ApiProperty({
    example: 'DEMO-VUT',
    description: 'Forma corta del nombre de la dependencia.',
  })
  @IsString()
  @MaxLength(30, {
    message: 'El código solamente puede tener hasta 30 caracteres.',
  })
  abreviacion!: string;
}

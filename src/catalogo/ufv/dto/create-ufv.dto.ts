/**
 * Módulo: Catálogo - UFV
 * Archivo: create-ufv.dto.ts
 * Descripción:
 * Define los datos requeridos para registrar un nuevo valor UFV,
 * incluyendo las validaciones de fecha y valor numérico.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { IsDateString, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO: CreateUfvDto
 * Descripción:
 * Establece la estructura y las validaciones de los datos
 * necesarios para crear un registro UFV.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class CreateUfvDto {
  /**
   * Fecha correspondiente al valor UFV.
   * Debe tener el formato AAAA-MM-DD.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiProperty({
    description: 'Fecha correspondiente al valor de UFV.',
    example: '2026-11-07',
    type: String,
  })
  @IsDateString(
    {},
    { message: 'La fecha debe tener un formato válido (AAAA-MM-DD)' },
  )
  @IsNotEmpty({ message: 'La fecha no puede estar vacía' })
  fecha!: string;

  /**
   * Valor numérico de la UFV.
   * Debe encontrarse dentro del rango establecido.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiProperty({
    description: 'Valor de la UFV. Debe encontrarse entre 6 y 12.',
    example: 6.53642,
    minimum: 6,
    maximum: 12,
    type: Number,
  })
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @IsNotEmpty({ message: 'El valor no puede estar vacío' })
  @Min(6, { message: 'El valor no puede ser menor a 6' })
  @Max(12, { message: 'El valor no puede ser mayor a 12' })
  valor!: number;
}

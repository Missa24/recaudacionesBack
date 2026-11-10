/**
 * Módulo: Catálogo - Interes
 * Archivo: create-interes.dto.ts
 * Descripción:
 * Define los datos requeridos para registrar un nuevo valor de interés,
 * incluyendo las validaciones de fecha y valor numérico.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateInteresDto {
  /**
   * Fecha correspondiente al valor del interés.
   * Debe tener el formato AAAA-MM-DD.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */

  @ApiProperty({
    description: 'Fecha correspondiente al valor del interés.',
    example: '2026-11-09',
    type: String,
  })
  @IsDateString(
    {},
    { message: 'La fecha debe tener un formato válido (AAAA-MM-DD)' },
  )
  @IsNotEmpty({ message: 'La fecha no puede estar vacía' })
  fecha_publicacion!: string;

  /**
   * Valor numérico del interés.
   * Debe de encontrarse entre el rango establecido.
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiProperty({
    description: 'Valor de interés, Debe encontrarse entre 4 y 8.',
    example: 6.2531,
    minimum: 4,
    maximum: 8,
    type: Number,
  })
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @IsNotEmpty({ message: 'El valor no puede estar vacio' })
  @Min(4, { message: 'El valor no puede ser menor a 4' })
  @Max(8, { message: 'El valor no puede ser mayor a 8' })
  valor!: number;
}

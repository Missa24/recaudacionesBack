/**
 * Módulo: Catálogo - UFV
 * Archivo: create-ufv-api.dto.ts
 * Descripción:
 * Define los datos necesarios para registrar un valor UFV
 * obtenido desde la API externa, incluyendo el identificador
 * del usuario técnico responsable de la operación.
 *
 * Desarrollado por: Missael Apaza
 */

import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

/**
 * DTO: CreateUfvApiDto
 * Descripción:
 * Establece la estructura y validaciones de los datos
 * utilizados durante el registro de UFV desde una fuente externa.
 *
 * Desarrollado por: Missael Apaza
 */
export class CreateUfvApiDto {
  /**
   * Fecha correspondiente al valor UFV obtenido desde la API.
   * Desarrollado por: Missael Apaza
   */
  @IsDateString(
    {},
    { message: 'La fecha debe tener un formato válido (AAAA-MM-DD)' },
  )
  @IsNotEmpty({ message: 'La fecha no puede estar vacia' })
  fecha!: string;

  /**
   * Valor numérico de UFV recibido desde la fuente externa.
   * Desarrollado por: Missael Apaza
   */
  @IsNumber({}, { message: 'El valor debe ser un número' })
  @IsNotEmpty({ message: 'El valor no puede estar vacio' })
  @Min(6, { message: 'El valor no puede ser menor a 6' })
  @Max(12, { message: 'El valor no puede ser mayor a 12' })
  valor!: number;

  /**
   * Identificador UUID del usuario responsable del registro.
   * Desarrollado por: Missael Apaza
   */
  @IsUUID()
  userId!: string;
}

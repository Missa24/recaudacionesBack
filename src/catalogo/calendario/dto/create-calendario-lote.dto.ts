/**
 * Módulo: Catálogos - Calendario
 * Archivo: create-calendario-lote.dto.ts
 * Descripción:
 * Define los datos necesarios para registrar múltiples
 * fechas en el calendario institucional.
 *
 * Desarrollado por: Missael Apaza
 */

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { CreateCalendarioDto } from './create-calendario.dto';

/**
 * DTO: CreateCalendarioLoteDto
 * Descripción:
 * Permite registrar varias fechas del calendario
 * mediante una sola solicitud.
 *
 * Desarrollado por: Missael Apaza
 */
export class CreateCalendarioLoteDto {
  /**
   * Lista de fechas que se registrarán en el calendario.
   */
  @ApiProperty({
    type: [CreateCalendarioDto],
    example: [
      {
        fecha: '2026-01-01',
        habil: false,
        descripcion: 'Año Nuevo',
      },
      {
        fecha: '2026-07-16',
        habil: false,
        descripcion: 'Aniversario de La Paz',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCalendarioDto)
  fechas!: CreateCalendarioDto[];
}

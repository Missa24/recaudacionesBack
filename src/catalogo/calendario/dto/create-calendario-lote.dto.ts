/**
 * Módulo: Catálogos - Calendario
 * Archivo: create-calendario-rango.dto.ts
 * Descripción:
 * Define los datos necesarios para registrar un rango
 * de fechas en el calendario institucional.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCalendarioRangoDto {
  @ApiProperty({
    example: '2026-01-01',
    description: 'Fecha inicial del rango (YYYY-MM-DD).',
  })
  @IsDateString(
    {},
    { message: 'La fecha inicial debe tener formato AAAA-MM-DD.' },
  )
  fecha_inicio!: string;

  @ApiProperty({
    example: '2026-01-31',
    description: 'Fecha final del rango (YYYY-MM-DD).',
  })
  @IsDateString(
    {},
    { message: 'La fecha final debe tener formato AAAA-MM-DD.' },
  )
  fecha_fin!: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Si se envía, se aplica a TODAS las fechas. Si se omite, se calcula automáticamente (lun-vie = hábil).',
  })
  @IsOptional()
  @IsBoolean()
  habil?: boolean;

  @ApiPropertyOptional({
    example: 'Feriado nacional',
    description: 'Descripción opcional aplicada a todas las fechas del rango.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}

/**
 * Módulo: Catálogos - Calendario
 * Archivo: create-calendario.dto.ts
 * Descripción:
 * Define las propiedades necesarias para registrar una fecha
 * en el calendario institucional.
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

/**
 * DTO: CreateCalendarioDto
 * Descripción:
 * Define los datos para registrar una fecha en el calendario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class CreateCalendarioDto {
  /**
   * Fecha que se registrará en el calendario.
   */
  @ApiProperty({
    example: '2026-01-01',
    description: 'Fecha del calendario en formato YYYY-MM-DD.',
  })
  @IsDateString()
  fecha!: string;

  /**
   * Indica si la fecha corresponde a un día hábil.
   */
  @ApiPropertyOptional({
    example: false,
    default: true,
    description: 'Indica si la fecha es hábil.',
  })
  @IsOptional()
  @IsBoolean()
  habil?: boolean;

  /**
   * Descripción o motivo de la configuración de la fecha.
   */
  @ApiPropertyOptional({
    example: 'Feriado nacional',
    maxLength: 120,
    description: 'Descripción o motivo de la fecha registrada.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  descripcion?: string | null;
}

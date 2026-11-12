import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTarifaDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador del arancel detalle.',
  })
  @IsUUID('4', {
    message: 'El arancel detalle debe ser un UUID válido.',
  })
  arancel_det_id!: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Fecha inicial de vigencia.',
  })
  @IsDateString({}, { message: 'La fecha inicial de vigencia no es válida.' })
  vigente_desde!: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    nullable: true,
    description: 'Fecha final de vigencia. Puede ser nula.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha final de vigencia no es válida.' })
  vigente_hasta?: string | null;

  @ApiProperty({
    example: 150.5,
    minimum: 0,
    maximum: 999999999999.99,
    description: 'Monto de la tarifa.',
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto debe tener como máximo 2 decimales.' },
  )
  @Min(0, {
    message: 'El monto no puede ser negativo.',
  })
  @Max(999999999999.99, {
    message: 'El monto supera el máximo permitido.',
  })
  monto!: number;

  @ApiProperty({
    example: 'Resolución administrativa N° 001/2026',
    description: 'Referencia de aprobación de la tarifa.',
  })
  @IsString({
    message: 'La referencia de aprobación debe ser texto.',
  })
  @MinLength(1, {
    message: 'La referencia de aprobación no puede estar vacía.',
  })
  referencia_aprobacion!: string;
}

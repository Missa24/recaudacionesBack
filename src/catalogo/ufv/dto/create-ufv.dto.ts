import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUfvDto {
  /**
   * Fecha correspondiente al valor UFV.
   * Debe tener el formato AAAA-MM-DD.
   */
  @ApiProperty({
    description: 'Fecha correspondiente al valor de UFV.',
    example: '2026-11-07',
    type: String,
  })
  @IsNotEmpty({ message: 'La fecha no puede estar vacía' })
  @IsDateString(
    {},
    { message: 'La fecha debe tener un formato válido (AAAA-MM-DD)' },
  )
  fecha!: string;

  /**
   * Valor numérico de la UFV.
   * Positivo, hasta 6 decimales y máximo 6 dígitos enteros (numeric(12,6)).
   */
  @ApiProperty({
    description:
      'Valor de la UFV. Debe ser positivo, con máximo 6 decimales y hasta 6 dígitos enteros.',
    example: 3.37215,
    type: Number,
  })
  @IsNotEmpty({ message: 'El valor no puede estar vacío' })
  @IsNumber(
    { maxDecimalPlaces: 6 },
    { message: 'El valor debe ser un número con máximo 6 decimales' },
  )
  @IsPositive({ message: 'El valor debe ser mayor a 0' })
  valor!: number;
}

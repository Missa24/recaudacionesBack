import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCalendarioDto {
  /**
   * Fecha que se registrará en el calendario.
   */
  @ApiProperty({
    example: '2026-01-01',
    description: 'Fecha del calendario en formato YYYY-MM-DD.',
  })
  @IsNotEmpty({ message: 'La fecha es obligatoria.' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD.' })
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
  @IsBoolean({ message: 'El campo habil debe ser booleano.' })
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
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(120, { message: 'La descripción no debe superar 120 caracteres.' })
  descripcion?: string | null;
}

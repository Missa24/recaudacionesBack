import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTipoTramiteCatalogoDto {
  @ApiProperty({ example: 'T-001', maxLength: 30 })
  @IsString({ message: 'El código debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @MaxLength(30, {
    message: 'El código no debe superar los 30 caracteres.',
  })
  codigo!: string;

  @ApiProperty({ example: 'Trámite de ejemplo', maxLength: 200 })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(200, {
    message: 'El nombre no debe superar los 200 caracteres.',
  })
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Descripción del trámite',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  descripcion?: string | null;

  @ApiProperty({
    example: 'PRESENCIAL',
    maxLength: 30,
    description: 'Valor del tipo VUT definido por el catálogo de negocio.',
  })
  @IsString({ message: 'El tipo VUT debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El tipo VUT es obligatorio.' })
  @MaxLength(30, {
    message: 'El tipo VUT no debe superar los 30 caracteres.',
  })
  tipo_vut!: string;

  @ApiPropertyOptional({
    example: 'uuid-dependencia',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'La dependencia ejecutora debe ser un UUID válido.',
  })
  dependencia_ejecutora_id?: string | null;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean({
    message: 'Requiere hoja de ruta debe ser verdadero o falso.',
  })
  requiere_hoja_ruta?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean({
    message: 'Requiere derivación debe ser verdadero o falso.',
  })
  requiere_derivacion?: boolean;
}

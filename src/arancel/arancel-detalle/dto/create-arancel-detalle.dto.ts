import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateArancelDetalleDto {
  @ApiProperty({ example: 'uuid-arancel-general' })
  @IsUUID('4', {
    message: 'El identificador del arancel general debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'El arancel general es obligatorio.',
  })
  arancel_general_id!: string;

  @ApiProperty({ example: 'uuid-tipo-tramite' })
  @IsUUID('4', {
    message: 'El identificador del tipo de trámite debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'El tipo de trámite es obligatorio.',
  })
  tipo_tramite_id!: string;

  @ApiProperty({
    example: 'AD-001',
    maxLength: 20,
  })
  @IsString({
    message: 'El número de arancel debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El número de arancel es obligatorio.',
  })
  @MaxLength(20, {
    message: 'El número de arancel no debe superar los 20 caracteres.',
  })
  nro_arancel_det!: string;

  @ApiProperty({
    example: 'Detalle del arancel',
    maxLength: 250,
  })
  @IsString({
    message: 'La descripción debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La descripción es obligatoria.',
  })
  @MaxLength(250, {
    message: 'La descripción no debe superar los 250 caracteres.',
  })
  descripcion!: string;

  @ApiPropertyOptional({
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo monto variable debe ser verdadero o falso.',
  })
  monto_variable?: boolean;

  @ApiPropertyOptional({
    example: 'UNIDAD',
    maxLength: 80,
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: 'La unidad de cálculo debe ser un texto.',
  })
  @MaxLength(80, {
    message: 'La unidad de cálculo no debe superar los 80 caracteres.',
  })
  unidad_calculo?: string | null;
}

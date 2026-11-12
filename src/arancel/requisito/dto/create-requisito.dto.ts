import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsUUID,
  Max,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateRequisitoDto {
  @ApiProperty({ example: 'uuid-tipo-tramite' })
  @IsUUID('4', {
    message: 'El tipo de trámite debe ser un UUID válido.',
  })
  tipo_tramite_id!: string;

  @ApiProperty({
    example: 'uuid-requisito-catalogo',
    description: 'Identificador del requisito del catálogo compartido.',
  })
  @IsUUID('4', {
    message: 'El requisito del catálogo debe ser un UUID válido.',
  })
  requisito_catalogo_id!: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo obligatorio debe ser verdadero o falso.',
  })
  obligatorio?: boolean;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: 32767,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El orden debe ser un número entero.',
  })
  @Min(1, {
    message: 'El orden debe ser mayor que cero.',
  })
  @Max(32767, {
    message: 'El orden no debe superar 32767.',
  })
  orden?: number;
}

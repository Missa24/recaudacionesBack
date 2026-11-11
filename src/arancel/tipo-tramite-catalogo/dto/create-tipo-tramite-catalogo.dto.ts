import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTipoTramiteCatalogoDto {
  @ApiProperty({ example: 'T-001', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  codigo!: string;

  @ApiProperty({ example: 'Trámite de ejemplo', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Descripción del trámite', nullable: true })
  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @ApiProperty({
    example: 'PRESENCIAL',
    maxLength: 30,
    description: 'Valor del tipo VUT definido por el catálogo de negocio.',
  })
  @IsString()
  @MaxLength(30)
  tipo_vut!: string;

  @ApiPropertyOptional({ example: 'uuid-dependencia', nullable: true })
  @IsOptional()
  @IsUUID()
  dependencia_ejecutora_id?: string | null;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  requiere_hoja_ruta!: boolean;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  requiere_derivacion!: boolean;
}

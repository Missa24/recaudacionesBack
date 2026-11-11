import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateArancelDetalleDto {
  @ApiProperty({ example: 'uuid-arancel-general' })
  @IsUUID()
  arancel_gral_id!: string;

  @ApiProperty({ example: 'uuid-tipo-tramite' })
  @IsUUID()
  tipo_tramite_id!: string;

  @ApiProperty({ example: 'AD-001', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  nro_arancel_det!: string;

  @ApiProperty({ example: 'Detalle del arancel', maxLength: 250 })
  @IsString()
  @MaxLength(250)
  descripcion!: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  monto_variable!: boolean;

  @ApiPropertyOptional({ example: 'UNIDAD', maxLength: 80, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  unidad_calculo?: string | null;
}

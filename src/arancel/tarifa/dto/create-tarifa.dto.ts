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
} from 'class-validator';

export class CreateTarifaDto {
  @ApiProperty({ example: 'uuid-arancel-detalle' })
  @IsUUID()
  arancel_det_id!: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  vigente_desde!: string;

  @ApiPropertyOptional({ example: '2026-12-31', nullable: true })
  @IsOptional()
  @IsDateString()
  vigente_hasta?: string | null;

  @ApiProperty({ example: 125.5, minimum: 0, maximum: 999999999999.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999.99)
  monto!: number;

  @ApiPropertyOptional({ example: 'Resolución 001/2026', nullable: true })
  @IsOptional()
  @IsString()
  referencia_aprobacion?: string | null;
}

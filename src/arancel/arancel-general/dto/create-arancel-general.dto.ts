import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateArancelGeneralDto {
  @ApiProperty({ example: 'uuid-dependencia' })
  @IsUUID()
  dependencia_id!: string;

  @ApiProperty({ example: 'AR-001', maxLength: 15 })
  @IsString()
  @MaxLength(15)
  nro_arancel_gral!: string;

  @ApiProperty({ example: 'Arancel general de ejemplo', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  descripcion!: string;

  @ApiPropertyOptional({ example: 'uuid-cuenta-bancaria', nullable: true })
  @IsOptional()
  @IsUUID()
  cuenta_destino_id?: string | null;
}

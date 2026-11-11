import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateRequisitoDto {
  @ApiProperty({ example: 'uuid-tipo-tramite' })
  @IsUUID()
  tipo_tramite_id!: string;

  @ApiProperty({
    example: 'uuid-requisito-catalogo',
    description: 'Identificador de catalogo.requisito.',
  })
  @IsUUID()
  requisito_catalogo_id!: string;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  obligatorio!: boolean;

  @ApiProperty({ example: 1, minimum: 0, maximum: 32767 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(32767)
  orden!: number;
}

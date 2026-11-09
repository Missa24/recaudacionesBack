import { PartialType } from '@nestjs/mapped-types';
import { CreateDependenciaDto } from './create-dependencia.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDependenciaDto extends PartialType(CreateDependenciaDto) {
  @ApiProperty({
    description:
      'Condicional para verificar si una unidad es desconcentrada o no: true o false',
    example: 'false',
  })
  @IsOptional()
  @IsBoolean()
  es_unidad_desconcentrada?: boolean;
}

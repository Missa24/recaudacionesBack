import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryDependenciaDto extends QueryPaginatedDto {
  @ApiPropertyOptional({
    example: 'DEMO-UNI',
    description: 'Filtra las dependencias por el código',
  })
  @IsOptional()
  @IsString({ message: 'El codigo de debe tener caracteres' })
  codigo?: string;

  @ApiPropertyOptional({
    example: 'DEMO-VUT',
    description: 'Filtra las dependencias por la abreviacion',
  })
  @IsOptional()
  @IsString({ message: 'La abreviación debe tener caracteres' })
  abreviacion?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Filtra por condicion de unidad desconcentrada: true o false',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown => {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  es_unidad_desconcentrada?: boolean;
}

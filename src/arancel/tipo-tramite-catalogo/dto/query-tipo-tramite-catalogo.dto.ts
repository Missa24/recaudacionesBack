import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryTipoTramiteCatalogoDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: 'COD-01' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({ example: 'Trámite de ejemplo' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'uuid-dependencia' })
  @IsOptional()
  @IsUUID()
  dependencia_ejecutora_id?: string;
}

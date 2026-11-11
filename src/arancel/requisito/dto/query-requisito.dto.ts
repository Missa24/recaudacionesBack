import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryRequisitoDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: 'uuid-tipo-tramite' })
  @IsOptional()
  @IsUUID()
  tipo_tramite_id?: string;

  @ApiPropertyOptional({ example: 'uuid-requisito-catalogo' })
  @IsOptional()
  @IsUUID()
  requisito_catalogo_id?: string;
}

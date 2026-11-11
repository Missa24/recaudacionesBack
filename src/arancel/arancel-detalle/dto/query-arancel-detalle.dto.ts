import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryArancelDetalleDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: 'uuid-arancel-general' })
  @IsOptional()
  @IsUUID()
  arancel_gral_id?: string;

  @ApiPropertyOptional({ example: 'uuid-tipo-tramite' })
  @IsOptional()
  @IsUUID()
  tipo_tramite_id?: string;
}

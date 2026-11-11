import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryArancelRangoDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: 'uuid-arancel-detalle' })
  @IsOptional()
  @IsUUID()
  arancel_det_id?: string;

  @ApiPropertyOptional({ example: 'uuid-tarifa' })
  @IsOptional()
  @IsUUID()
  tarifa_id?: string;
}

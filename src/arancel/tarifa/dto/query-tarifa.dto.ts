import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryTarifaDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: 'uuid-arancel-detalle' })
  @IsOptional()
  @IsUUID()
  arancel_det_id?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  vigente_desde?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  vigente_hasta?: string;
}

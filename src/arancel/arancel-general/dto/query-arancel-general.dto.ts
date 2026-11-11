import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryArancelGeneralDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: 'uuid-dependencia' })
  @IsOptional()
  @IsUUID()
  dependencia_id?: string;
}

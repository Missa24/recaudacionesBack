import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryUsuarioRolDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: '10000000-0000-4000-8000-000000000001' })
  @IsOptional()
  @IsUUID()
  id_usuario?: string;

  @ApiPropertyOptional({ example: '20000000-0000-4000-8000-000000000001' })
  @IsOptional()
  @IsUUID()
  id_rol?: string;
}

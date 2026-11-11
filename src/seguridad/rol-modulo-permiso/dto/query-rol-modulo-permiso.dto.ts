import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryRolModuloPermisoDto extends QueryPaginatedDto {
  @ApiPropertyOptional({ example: '20000000-0000-4000-8000-000000000004' })
  @IsOptional()
  @IsUUID()
  id_rol?: string;

  @ApiPropertyOptional({ example: '30000000-0000-4000-8000-000000000004' })
  @IsOptional()
  @IsUUID()
  id_modulo?: string;

  @ApiPropertyOptional({ example: '40000000-0000-4000-8000-000000000003' })
  @IsOptional()
  @IsUUID()
  id_permiso?: string;
}

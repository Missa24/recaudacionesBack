import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryPaginatedDto } from 'src/shared/dto/query-paginated.dto';

export class QueryBancoDto extends QueryPaginatedDto {
  @ApiPropertyOptional({
    example: 'Banco de demostracion',
    description: 'Filtra los bancos por nombre',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe tener caracteres' })
  nombre?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBancoDto {
  @ApiPropertyOptional({
    example: 'Banco de demostración',
    maxLength: 100,
    description: 'Nombre del banco.',
  })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({
    example: 'DEMO',
    maxLength: 10,
    description: 'Codigo bancario referencial.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo_bc?: string;
}

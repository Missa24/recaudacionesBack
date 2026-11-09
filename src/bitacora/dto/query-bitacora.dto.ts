import { IsOptional, IsUUID, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBitacoraDto {
  @IsOptional()
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  sistemaId?: string;

  @IsOptional()
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  usuarioId?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'usuarios' })
  @IsString()
  tablaAfectada?: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: ['INSERT', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT'] })
  @IsString()
  accion?: string;

  @IsOptional()
  @ApiPropertyOptional({ format: 'date-time' })
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @ApiPropertyOptional({ format: 'date-time' })
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @ApiPropertyOptional({ minimum: 1, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
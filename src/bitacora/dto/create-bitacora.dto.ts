import {
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBitacoraDto {
  @IsOptional()
  @ApiPropertyOptional({ format: 'uuid', description: 'ID del sistema relacionado' })
    @ApiProperty({ example: 'usuarios', description: 'Tabla afectada por la operación' })
    @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del registro afectado' })
    @ApiProperty({ enum: ['INSERT', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT'], example: 'UPDATE' })
  @IsUUID()
  sistemaId?: string;

  @IsString()
    @MaxLength(100)
    tablaAfectada!: string;

  @IsUUID()
    registroId!: string;

  @IsString()
    @MaxLength(50)
    @Matches(/^(INSERT|UPDATE|DELETE|RESTORE|LOGIN|LOGOUT)$/, {
        message: 'Acción debe ser INSERT, UPDATE, DELETE, RESTORE, LOGIN o LOGOUT',
    })
    accion!: string;

  @IsOptional()
  @ApiPropertyOptional({ type: Object, description: 'Estado anterior del registro' })
  @IsObject()
  datosAnteriores?: any;

  @IsOptional()
  @ApiPropertyOptional({ type: Object, description: 'Estado nuevo del registro' })
  @IsObject()
  datosNuevos?: any;

  @IsOptional()
  @ApiPropertyOptional({ example: '192.168.1.10' })
  @IsString()
  @MaxLength(50)
  ipOrigen?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Mozilla/5.0' })
  @IsString()
  userAgent?: string;

  @IsOptional()
  @ApiPropertyOptional({ format: 'uuid', description: 'ID del usuario que ejecutó la acción' })
  @IsUUID()
  usuarioId?: string;
}
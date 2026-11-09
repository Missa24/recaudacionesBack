import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateApiTokenDto {  
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  sistemaId!: string;

  @ApiProperty({ example: 'Token de prueba' })
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 'Descripción del token' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: ['read', 'write'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permisos?: string[];

  @ApiProperty({ example: '2023-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  fechaExpiracion?: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ipOrigen?: string;

  @ApiProperty({ example: 'Mozilla/5.0' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateArancelGeneralDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador de la dependencia',
  })
  @IsUUID('all', {
    message: 'El identificador de la dependencia debe ser un UUID válido.',
  })
  @IsNotEmpty({
    message: 'La dependencia es obligatoria.',
  })
  dependencia_id!: string;

  @ApiProperty({
    example: 'AR-001',
    maxLength: 15,
    description: 'Número de arancel general',
  })
  @IsString({
    message: 'El número de arancel general debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    message: 'El número de arancel general es obligatorio.',
  })
  @MaxLength(15, {
    message: 'El número de arancel general no debe superar los 15 caracteres.',
  })
  nro_arancel_gral!: string;

  @ApiProperty({
    example: 'Arancel general de ejemplo',
    maxLength: 200,
    description: 'Descripción del arancel general',
  })
  @IsString({
    message: 'La descripción debe ser una cadena de texto.',
  })
  @IsNotEmpty({
    message: 'La descripción es obligatoria.',
  })
  @MaxLength(200, {
    message: 'La descripción no debe superar los 200 caracteres.',
  })
  descripcion!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
    description: 'Identificador de la cuenta bancaria de destino',
  })
  @IsOptional()
  @IsUUID('all', {
    message: 'El identificador de la cuenta bancaria debe ser un UUID válido.',
  })
  cuenta_destino_id?: string | null;
}

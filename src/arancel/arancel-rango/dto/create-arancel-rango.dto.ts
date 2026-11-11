import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateArancelRangoDto {
  @ApiProperty({ example: 'uuid-tarifa' })
  @IsUUID()
  tarifa_id!: string;
  
  @ApiProperty({ example: 0, minimum: 0, maximum: 999999999999.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999.99)
  desde!: number;

  @ApiPropertyOptional({
    example: 1000,
    minimum: 0,
    maximum: 999999999999.99,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999.99)
  hasta?: number | null;

  @ApiProperty({ example: 50, minimum: 0, maximum: 999999999999.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999.99)
  base_fija!: number;

  @ApiProperty({ example: 1.25, minimum: 0, maximum: 99.9999 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(99.9999)
  porcentaje!: number;

  @ApiProperty({ example: 1000, minimum: 0, maximum: 999999999999.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999.99)
  excedente!: number; 
}

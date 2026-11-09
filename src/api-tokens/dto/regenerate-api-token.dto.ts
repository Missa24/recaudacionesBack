import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class RegenerateApiTokenDto {
  @ApiProperty({ description: 'Días de expiración del nuevo token', example: 30 })
  @IsNotEmpty({ message: 'dias_expiracion es obligatorio' })
  @IsNumber({}, { message: 'dias_expiracion debe ser un número' })
  @Min(1)
  @Max(365)
  dias_expiracion!: number;
}
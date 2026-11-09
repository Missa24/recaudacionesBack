import { ApiProperty } from '@nestjs/swagger';

export class ApiTokenResponseDto {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    nombre!: string;

  @ApiProperty()
    sistema_origen!: string;

  @ApiProperty()
    token!: string;

  @ApiProperty({ required: false })
  descripcion?: string;

  @ApiProperty({ type: [String] })
    permisos!: string[];

  @ApiProperty({ required: false })
  usuario_id?: string;

  @ApiProperty()
    fecha_creacion!: Date;

  @ApiProperty({ required: false })
  fecha_expiracion?: Date;

  @ApiProperty({ required: false })
  fecha_ultimo_uso?: Date;

  @ApiProperty()
    activo!: boolean;
}
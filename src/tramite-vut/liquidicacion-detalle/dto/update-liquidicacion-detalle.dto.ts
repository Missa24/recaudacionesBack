import { PartialType } from '@nestjs/swagger';
import { CreateLiquidicacionDetalleDto } from './create-liquidicacion-detalle.dto';

export class UpdateLiquidicacionDetalleDto extends PartialType(CreateLiquidicacionDetalleDto) {}

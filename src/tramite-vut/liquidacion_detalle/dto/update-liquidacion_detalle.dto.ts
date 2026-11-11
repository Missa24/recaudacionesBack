import { PartialType } from '@nestjs/swagger';
import { CreateLiquidacionDetalleDto } from './create-liquidacion_detalle.dto';

export class UpdateLiquidacionDetalleDto extends PartialType(CreateLiquidacionDetalleDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateCotizacionDetalleDto } from './create-cotizacion-detalle.dto';

export class UpdateCotizacionDetalleDto extends PartialType(CreateCotizacionDetalleDto) {}

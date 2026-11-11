import { Module } from '@nestjs/common';
import { CotizacionDetalleService } from './cotizacion_detalle.service';
import { CotizacionDetalleController } from './cotizacion_detalle.controller';

@Module({
  controllers: [CotizacionDetalleController],
  providers: [CotizacionDetalleService],
})
export class CotizacionDetalleModule {}

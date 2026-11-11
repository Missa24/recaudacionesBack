import { Module } from '@nestjs/common';
import { CotizacionDetalleService } from './cotizacion-detalle.service';
import { CotizacionDetalleController } from './cotizacion-detalle.controller';

@Module({
  controllers: [CotizacionDetalleController],
  providers: [CotizacionDetalleService],
})
export class CotizacionDetalleModule {}

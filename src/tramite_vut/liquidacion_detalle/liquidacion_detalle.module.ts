import { Module } from '@nestjs/common';
import { LiquidacionDetalleService } from './liquidacion_detalle.service';
import { LiquidacionDetalleController } from './liquidacion_detalle.controller';

@Module({
  controllers: [LiquidacionDetalleController],
  providers: [LiquidacionDetalleService],
})
export class LiquidacionDetalleModule {}

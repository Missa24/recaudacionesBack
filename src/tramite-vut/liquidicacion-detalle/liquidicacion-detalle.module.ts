import { Module } from '@nestjs/common';
import { LiquidicacionDetalleService } from './liquidicacion-detalle.service';
import { LiquidicacionDetalleController } from './liquidicacion-detalle.controller';

@Module({
  controllers: [LiquidicacionDetalleController],
  providers: [LiquidicacionDetalleService],
})
export class LiquidicacionDetalleModule {}

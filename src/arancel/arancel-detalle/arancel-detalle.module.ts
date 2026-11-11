import { Module } from '@nestjs/common';
import { ArancelDetalleService } from './arancel-detalle.service';
import { ArancelDetalleController } from './arancel-detalle.controller';

@Module({
  controllers: [ArancelDetalleController],
  providers: [ArancelDetalleService],
})
export class ArancelDetalleModule {}

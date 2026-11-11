import { Module } from '@nestjs/common';
import { ArancelRangoService } from './arancel-rango.service';
import { ArancelRangoController } from './arancel-rango.controller';

@Module({
  controllers: [ArancelRangoController],
  providers: [ArancelRangoService],
})
export class ArancelRangoModule {}

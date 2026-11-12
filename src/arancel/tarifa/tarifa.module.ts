import { Module } from '@nestjs/common';
import { TarifaService } from './tarifa.service';
import { TarifaController } from './tarifa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarifa } from './entities/tarifa.entity';
import { ArancelDetalleModule } from '../arancel-detalle/arancel-detalle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tarifa]),
    TarifaModule,
    ArancelDetalleModule,
  ],
  controllers: [TarifaController],
  providers: [TarifaService],
})
export class TarifaModule {}

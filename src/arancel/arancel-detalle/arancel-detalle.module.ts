import { Module } from '@nestjs/common';
import { ArancelDetalleService } from './arancel-detalle.service';
import { ArancelDetalleController } from './arancel-detalle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelDetalle } from './entities/arancel-detalle.entity';
import { ArancelGeneralModule } from '../arancel-general/arancel-general.module';
import { TipoTramiteCatalogoModule } from '../tipo-tramite-catalogo/tipo-tramite-catalogo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArancelDetalle]),
    ArancelGeneralModule,
    TipoTramiteCatalogoModule,
  ],
  controllers: [ArancelDetalleController],
  providers: [ArancelDetalleService],
})
export class ArancelDetalleModule {}

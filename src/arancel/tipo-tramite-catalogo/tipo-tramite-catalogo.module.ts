import { Module } from '@nestjs/common';
import { TipoTramiteCatalogoService } from './tipo-tramite-catalogo.service';
import { TipoTramiteCatalogoController } from './tipo-tramite-catalogo.controller';

@Module({
  controllers: [TipoTramiteCatalogoController],
  providers: [TipoTramiteCatalogoService],
})
export class TipoTramiteCatalogoModule {}

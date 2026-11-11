import { Module } from '@nestjs/common';
import { TipoTramiteCatalogoService } from './tipo-tramite-catalogo.service';
import { TipoTramiteCatalogoController } from './tipo-tramite-catalogo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoTramiteCatalogo } from './entities/tipo-tramite-catalogo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoTramiteCatalogo])],
  controllers: [TipoTramiteCatalogoController],
  providers: [TipoTramiteCatalogoService],
})
export class TipoTramiteCatalogoModule {}

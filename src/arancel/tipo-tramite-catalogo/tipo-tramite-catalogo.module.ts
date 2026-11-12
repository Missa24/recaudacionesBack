import { Module } from '@nestjs/common';
import { TipoTramiteCatalogoService } from './tipo-tramite-catalogo.service';
import { TipoTramiteCatalogoController } from './tipo-tramite-catalogo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoTramiteCatalogo } from './entities/tipo-tramite-catalogo.entity';
import { DependenciaModule } from 'src/catalogo/dependencia/dependencia.module';

@Module({
  imports: [TypeOrmModule.forFeature([TipoTramiteCatalogo]), DependenciaModule],
  controllers: [TipoTramiteCatalogoController],
  providers: [TipoTramiteCatalogoService],
  exports: [TipoTramiteCatalogoService],
})
export class TipoTramiteCatalogoModule {}

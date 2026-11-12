import { Module } from '@nestjs/common';
import { RequisitoController } from './requisito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelRequisito } from './entities/requisito.entity';
import { Requisito as RequisitoCatalogo } from 'src/catalogo/requisito/entities/requisito.entity';
import { TipoTramiteCatalogoModule } from '../tipo-tramite-catalogo/tipo-tramite-catalogo.module';
import { RequisitoModule as RequisitoModuleCatalogo } from 'src/catalogo/requisito/requisito.module';
import { RequisitoService } from './requisito.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([ArancelRequisito, RequisitoCatalogo]),
    RequisitoModuleCatalogo,
    TipoTramiteCatalogoModule,
  ],
  controllers: [RequisitoController],
  providers: [RequisitoService],
})
export class RequisitoModule {}

import { Module } from '@nestjs/common';
import { RequisitoService } from './requisito.service';
import { RequisitoController } from './requisito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArancelRequisito } from './entities/requisito.entity';
import { Requisito as RequisitoCatalogo } from 'src/catalogo/requisito/entities/requisito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArancelRequisito, RequisitoCatalogo])],
  controllers: [RequisitoController],
  providers: [RequisitoService],
})
export class RequisitoModule {}

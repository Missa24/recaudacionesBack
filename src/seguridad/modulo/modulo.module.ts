import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modulo } from './entities/modulo.entity';
import { ModuloController } from './modulo.controller';
import { ModuloService } from './modulo.service';

/**
 * Registra el repositorio y expone el servicio para otros módulos.
 * Desarrollado por: Oscar Canchari.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Modulo])],
  controllers: [ModuloController],
  providers: [ModuloService],
  exports: [ModuloService],
})
export class ModuloModule {}

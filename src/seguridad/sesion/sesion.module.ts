import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from '../usuario/entities/usuario.entity';
import { Sesion } from './entities/sesion.entity';
import { SesionService } from './sesion.service';

/**
 * Registra las entidades y exporta el servicio de sesiones.
 * Autor: Oscar Canchari
 */
@Module({
  imports: [TypeOrmModule.forFeature([Sesion, Usuario])],
  providers: [SesionService],
  exports: [SesionService],
})
export class SesionModule {}

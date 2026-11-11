import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { PermisoController } from './permiso.controller';
import { PermisoService } from './permiso.service';

/**
 * Registra el repositorio y expone el servicio para otros módulos.
 * Desarrollado por: Oscar Canchari.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Permiso])],
  controllers: [PermisoController],
  providers: [PermisoService],
  exports: [PermisoService],
})
export class PermisoModule {}
